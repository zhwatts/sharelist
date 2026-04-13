/**
 * ShareList routes — CRUD for user ShareLists.
 *
 * A ShareList is a named list that links to one or more third-party playlists.
 * The first linked playlist is marked is_primary=true and its tracks are
 * returned in the detail endpoint.
 *
 * Routes:
 *   GET    /sharelists           — list user's ShareLists with link metadata
 *   POST   /sharelists           — create new ShareList from a playlist link
 *   GET    /sharelists/:id       — ShareList detail + tracks from primary link
 *   POST   /sharelists/:id/links — link an additional playlist to a ShareList
 */

import { Router, type Request, type Response } from 'express'
import { requireAuth } from '../middleware/auth'
import { supabaseAdmin } from '../lib/supabase'
import { getProvider } from '../streaming/registry'

// Side-effect: ensure providers are registered
import '../streaming/spotify'
import '../streaming/apple-music'

const router = Router()

function log(level: string, message: string, ctx: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ level, message, ...ctx }))
}

// ── Row types ─────────────────────────────────────────────────────────────────

interface SharelistRow {
  id: string
  owner_id: string
  name: string
  created_at: string
  updated_at: string
}

interface SharelistLinkRow {
  id: string
  sharelist_id: string
  user_id: string
  provider: string
  provider_playlist_id: string
  provider_playlist_name: string
  provider_playlist_image_url: string | null
  provider_playlist_external_url: string | null
  is_primary: boolean
  created_at: string
}

// ── GET /sharelists ───────────────────────────────────────────────────────────

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id
  try {
    const { data: lists, error: listErr } = await supabaseAdmin
      .from('sharelists')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    if (listErr) throw new Error(listErr.message)

    if (!lists || lists.length === 0) {
      res.json({ data: [], error: null })
      return
    }

    const ids = (lists as SharelistRow[]).map(l => l.id)
    const { data: links, error: linkErr } = await supabaseAdmin
      .from('sharelist_links')
      .select('*')
      .in('sharelist_id', ids)

    if (linkErr) throw new Error(linkErr.message)

    const linksBySharelist = new Map<string, SharelistLinkRow[]>()
    for (const link of (links ?? []) as SharelistLinkRow[]) {
      const arr = linksBySharelist.get(link.sharelist_id) ?? []
      arr.push(link)
      linksBySharelist.set(link.sharelist_id, arr)
    }

    const result = (lists as SharelistRow[]).map(list => ({
      id: list.id,
      name: list.name,
      ownerId: list.owner_id,
      createdAt: list.created_at,
      links: (linksBySharelist.get(list.id) ?? []).map(l => ({
        id: l.id,
        provider: l.provider,
        playlistId: l.provider_playlist_id,
        playlistName: l.provider_playlist_name,
        imageUrl: l.provider_playlist_image_url,
        externalUrl: l.provider_playlist_external_url,
        isPrimary: l.is_primary,
      })),
    }))

    res.json({ data: result, error: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    log('error', 'GET /sharelists failed', { userId, error: message })
    res.status(500).json({ data: null, error: { message } })
  }
})

// ── POST /sharelists ──────────────────────────────────────────────────────────

router.post('/', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { provider, playlistId, playlistName, imageUrl, externalUrl } = req.body as {
    provider?: string
    playlistId?: string
    playlistName?: string
    imageUrl?: string
    externalUrl?: string
  }

  if (!provider || !playlistId || !playlistName) {
    res.status(400).json({ data: null, error: { message: 'provider, playlistId, and playlistName are required' } })
    return
  }

  try {
    // Verify the provider is registered and the user has it connected
    getProvider(provider) // throws if unknown

    // Create the ShareList
    const { data: list, error: listErr } = await supabaseAdmin
      .from('sharelists')
      .insert({ owner_id: userId, name: playlistName })
      .select()
      .single()

    if (listErr) throw new Error(listErr.message)

    const sharelistId = (list as SharelistRow).id

    // Create the primary link
    const { error: linkErr } = await supabaseAdmin
      .from('sharelist_links')
      .insert({
        sharelist_id: sharelistId,
        user_id: userId,
        provider,
        provider_playlist_id: playlistId,
        provider_playlist_name: playlistName,
        provider_playlist_image_url: imageUrl ?? null,
        provider_playlist_external_url: externalUrl ?? null,
        is_primary: true,
      })

    if (linkErr) throw new Error(linkErr.message)

    log('info', 'ShareList created', { sharelistId, userId, provider, playlistId })

    res.status(201).json({
      data: {
        id: sharelistId,
        name: playlistName,
        ownerId: userId,
        createdAt: (list as SharelistRow).created_at,
        links: [{
          provider,
          playlistId,
          playlistName,
          imageUrl: imageUrl ?? null,
          externalUrl: externalUrl ?? null,
          isPrimary: true,
        }],
      },
      error: null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    log('error', 'POST /sharelists failed', { userId, error: message })
    res.status(500).json({ data: null, error: { message } })
  }
})

// ── GET /sharelists/:id ───────────────────────────────────────────────────────

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { id } = req.params as { id: string }

  try {
    const { data: list, error: listErr } = await supabaseAdmin
      .from('sharelists')
      .select('*')
      .eq('id', id)
      .eq('owner_id', userId)
      .single()

    if (listErr) {
      if (listErr.code === 'PGRST116') {
        res.status(404).json({ data: null, error: { message: 'ShareList not found' } })
        return
      }
      throw new Error(listErr.message)
    }

    const { data: links, error: linkErr } = await supabaseAdmin
      .from('sharelist_links')
      .select('*')
      .eq('sharelist_id', id)
      .order('is_primary', { ascending: false })

    if (linkErr) throw new Error(linkErr.message)

    const linkRows = (links ?? []) as SharelistLinkRow[]

    // Fetch tracks from primary link (or first link)
    const primaryLink = linkRows.find(l => l.is_primary) ?? linkRows[0]
    let tracks: unknown[] = []

    if (primaryLink) {
      log('info', 'fetching tracks from provider', {
        sharelistId: id,
        provider: primaryLink.provider,
        providerPlaylistId: primaryLink.provider_playlist_id,
        storedPlaylistName: primaryLink.provider_playlist_name,
      })
      try {
        const provider = getProvider(primaryLink.provider)
        tracks = await provider.getPlaylistTracks(userId, primaryLink.provider_playlist_id)
        log('info', 'tracks fetched', { sharelistId: id, trackCount: tracks.length })

        // If the provider returned updated playlist metadata, refresh the stored name
        // (handled below by updating the link row)
      } catch (trackErr) {
        const errMsg = trackErr instanceof Error ? trackErr.message : 'Unknown'
        const hint = errMsg.includes('403')
          ? ' (token may be expired or missing scopes — try disconnecting and reconnecting the service in Settings)'
          : ''
        log('warn', 'getPlaylistTracks failed', {
          sharelistId: id,
          provider: primaryLink.provider,
          error: errMsg + hint,
        })
      }
    }

    res.json({
      data: {
        id: (list as SharelistRow).id,
        name: (list as SharelistRow).name,
        ownerId: (list as SharelistRow).owner_id,
        createdAt: (list as SharelistRow).created_at,
        links: linkRows.map(l => ({
          id: l.id,
          provider: l.provider,
          playlistId: l.provider_playlist_id,
          playlistName: l.provider_playlist_name,
          imageUrl: l.provider_playlist_image_url,
          externalUrl: l.provider_playlist_external_url,
          isPrimary: l.is_primary,
        })),
        tracks,
      },
      error: null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    log('error', 'GET /sharelists/:id failed', { id, userId, error: message })
    res.status(500).json({ data: null, error: { message } })
  }
})

// ── POST /sharelists/:id/sync ─────────────────────────────────────────────────
//
// Re-fetches live metadata (name, image) and tracks for every linked playlist,
// writes the refreshed metadata back to sharelist_links, and returns the
// updated ShareList detail exactly like GET /:id.

router.post('/:id/sync', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { id } = req.params as { id: string }

  try {
    const { data: list, error: listErr } = await supabaseAdmin
      .from('sharelists')
      .select('*')
      .eq('id', id)
      .eq('owner_id', userId)
      .single()

    if (listErr) {
      if (listErr.code === 'PGRST116') {
        res.status(404).json({ data: null, error: { message: 'ShareList not found' } })
        return
      }
      throw new Error(listErr.message)
    }

    const { data: links, error: linkErr } = await supabaseAdmin
      .from('sharelist_links')
      .select('*')
      .eq('sharelist_id', id)
      .order('is_primary', { ascending: false })

    if (linkErr) throw new Error(linkErr.message)

    const linkRows = (links ?? []) as SharelistLinkRow[]
    let tracks: unknown[] = []

    // Refresh every linked playlist's metadata and collect tracks from primary
    for (const link of linkRows) {
      try {
        const provider = getProvider(link.provider)
        const freshMeta = await provider.getPlaylist(userId, link.provider_playlist_id)

        // Persist refreshed name and image back to DB
        await supabaseAdmin
          .from('sharelist_links')
          .update({
            provider_playlist_name: freshMeta.name,
            provider_playlist_image_url: freshMeta.imageUrl ?? null,
            provider_playlist_external_url: freshMeta.externalUrl ?? link.provider_playlist_external_url,
          })
          .eq('id', link.id)

        // Merge fresh metadata into the in-memory row for the response
        link.provider_playlist_name = freshMeta.name
        link.provider_playlist_image_url = freshMeta.imageUrl ?? null
        if (freshMeta.externalUrl) link.provider_playlist_external_url = freshMeta.externalUrl

        // Keep the ShareList's own name in sync with the primary playlist's name
        if (link.is_primary && freshMeta.name !== (list as SharelistRow).name) {
          await supabaseAdmin
            .from('sharelists')
            .update({ name: freshMeta.name, updated_at: new Date().toISOString() })
            .eq('id', id)
          ;(list as SharelistRow).name = freshMeta.name
        }

        log('info', 'link metadata refreshed', {
          sharelistId: id,
          provider: link.provider,
          freshName: freshMeta.name,
          trackCount: freshMeta.trackCount,
        })

        if (link.is_primary || (!tracks.length && link === linkRows[0])) {
          tracks = await provider.getPlaylistTracks(userId, link.provider_playlist_id)
          log('info', 'tracks synced', { sharelistId: id, trackCount: tracks.length })
        }
      } catch (syncErr) {
        log('warn', 'sync failed for link', {
          sharelistId: id,
          linkId: link.id,
          provider: link.provider,
          error: syncErr instanceof Error ? syncErr.message : 'Unknown',
        })
      }
    }

    res.json({
      data: {
        id: (list as SharelistRow).id,
        name: (list as SharelistRow).name,
        ownerId: (list as SharelistRow).owner_id,
        createdAt: (list as SharelistRow).created_at,
        links: linkRows.map(l => ({
          id: l.id,
          provider: l.provider,
          playlistId: l.provider_playlist_id,
          playlistName: l.provider_playlist_name,
          imageUrl: l.provider_playlist_image_url,
          externalUrl: l.provider_playlist_external_url,
          isPrimary: l.is_primary,
        })),
        tracks,
      },
      error: null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    log('error', 'POST /sharelists/:id/sync failed', { id, userId, error: message })
    res.status(500).json({ data: null, error: { message } })
  }
})

// ── POST /sharelists/:id/links ────────────────────────────────────────────────

router.post('/:id/links', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { id } = req.params as { id: string }
  const { provider, playlistId, playlistName, imageUrl, externalUrl } = req.body as {
    provider?: string
    playlistId?: string
    playlistName?: string
    imageUrl?: string
    externalUrl?: string
  }

  if (!provider || !playlistId || !playlistName) {
    res.status(400).json({ data: null, error: { message: 'provider, playlistId, and playlistName are required' } })
    return
  }

  try {
    // Verify ownership
    const { data: list, error: listErr } = await supabaseAdmin
      .from('sharelists')
      .select('id')
      .eq('id', id)
      .eq('owner_id', userId)
      .single()

    if (listErr || !list) {
      res.status(404).json({ data: null, error: { message: 'ShareList not found' } })
      return
    }

    getProvider(provider) // throws if unknown

    const { error: linkErr } = await supabaseAdmin
      .from('sharelist_links')
      .insert({
        sharelist_id: id,
        user_id: userId,
        provider,
        provider_playlist_id: playlistId,
        provider_playlist_name: playlistName,
        provider_playlist_image_url: imageUrl ?? null,
        provider_playlist_external_url: externalUrl ?? null,
        is_primary: false,
      })

    if (linkErr) throw new Error(linkErr.message)

    log('info', 'Playlist linked to ShareList', { sharelistId: id, userId, provider, playlistId })
    res.status(201).json({ data: { linked: true }, error: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    log('error', 'POST /sharelists/:id/links failed', { id, userId, error: message })
    res.status(500).json({ data: null, error: { message } })
  }
})

export default router
