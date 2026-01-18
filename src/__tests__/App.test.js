import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../App.vue'

// Mock fetch globally
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => { localStorageMock.store[key] = value }),
  removeItem: vi.fn((key) => { delete localStorageMock.store[key] }),
  clear: vi.fn(() => { localStorageMock.store = {} })
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('App.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()

    // Default mock für places endpoint
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, name: 'Test Place 1', likeCount: 5, dislikeCount: 2 },
        { id: 2, name: 'Test Place 2', likeCount: 3, dislikeCount: 1 }
      ])
    })
  })

  // Test 1: App rendert korrekt
  it('rendert die App-Komponente', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: ['LandingPage', 'LoginModal', 'CreatePlaceModal', 'PlaceDetailModal', 'BottomNav', 'ThemeToggle']
      }
    })

    await flushPromises()
    expect(wrapper.exists()).toBe(true)
  })

  // Test 2: Zeigt Landing Page wenn nicht eingeloggt
  it('zeigt Landing Page für nicht angemeldete Nutzer', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          LandingPage: { template: '<div class="landing-stub">Landing</div>' },
          LoginModal: true,
          CreatePlaceModal: true,
          PlaceDetailModal: true,
          BottomNav: true,
          ThemeToggle: true
        }
      }
    })

    await flushPromises()
    expect(wrapper.find('.landing-stub').exists()).toBe(true)
  })

  // Test 3: getBackendBase gibt korrekten URL zurück
  it('getBackendBase gibt Production URL zurück', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: ['LandingPage', 'LoginModal', 'CreatePlaceModal', 'PlaceDetailModal', 'BottomNav', 'ThemeToggle']
      }
    })

    await flushPromises()

    // Im Test-Environment sollte es den Production-URL zurückgeben
    const backendBase = wrapper.vm.getBackendBase()
    expect(backendBase).toContain('render.com')
  })

  // Test 4: loadPlaces lädt Places vom Backend
  it('loadPlaces lädt Places vom Backend', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: ['LandingPage', 'LoginModal', 'CreatePlaceModal', 'PlaceDetailModal', 'BottomNav', 'ThemeToggle']
      }
    })

    await flushPromises()

    expect(wrapper.vm.places).toHaveLength(2)
    expect(wrapper.vm.places[0].name).toBe('Test Place 1')
  })

  // Test 5: Berechnet totalLikes korrekt
  it('berechnet totalLikes korrekt', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: ['LandingPage', 'LoginModal', 'CreatePlaceModal', 'PlaceDetailModal', 'BottomNav', 'ThemeToggle']
      }
    })

    await flushPromises()

    // 5 + 3 = 8
    expect(wrapper.vm.totalLikes).toBe(8)
  })

  // Test 6: Berechnet totalDislikes korrekt
  it('berechnet totalDislikes korrekt', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: ['LandingPage', 'LoginModal', 'CreatePlaceModal', 'PlaceDetailModal', 'BottomNav', 'ThemeToggle']
      }
    })

    await flushPromises()

    // 2 + 1 = 3
    expect(wrapper.vm.totalDislikes).toBe(3)
  })

  // Test 7: enterGuestMode aktiviert Gast-Modus
  it('enterGuestMode aktiviert Gast-Modus', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: ['LandingPage', 'LoginModal', 'CreatePlaceModal', 'PlaceDetailModal', 'BottomNav', 'ThemeToggle']
      }
    })

    await flushPromises()

    expect(wrapper.vm.isGuestMode).toBe(false)
    wrapper.vm.enterGuestMode()
    expect(wrapper.vm.isGuestMode).toBe(true)
    expect(wrapper.vm.currentView).toBe('home')
  })

  // Test 8: logout setzt Auth-State zurück
  it('logout setzt Auth-State zurück', async () => {
    // Simuliere eingeloggten User
    localStorageMock.store['auth_token'] = 'test-token'
    localStorageMock.store['auth_username'] = 'testuser'

    const wrapper = mount(App, {
      global: {
        stubs: ['LandingPage', 'LoginModal', 'CreatePlaceModal', 'PlaceDetailModal', 'BottomNav', 'ThemeToggle', 'HomePage', 'SwipeDeck', 'LikesPage']
      }
    })

    await flushPromises()

    // Manuell auth setzen da localStorage Mock
    wrapper.vm.auth.isAuthenticated = true
    wrapper.vm.auth.username = 'testuser'
    wrapper.vm.auth.token = 'test-token'
    wrapper.vm.isGuestMode = true

    wrapper.vm.logout()

    expect(wrapper.vm.auth.isAuthenticated).toBe(false)
    expect(wrapper.vm.auth.username).toBeNull()
    expect(wrapper.vm.auth.token).toBeNull()
    expect(wrapper.vm.isGuestMode).toBe(false)
    expect(wrapper.vm.likedPlaces).toEqual([])
  })

  // Test 9: swipeStack filtert bereits geswiped Places
  it('swipeStack filtert bereits geswiped Places', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: ['LandingPage', 'LoginModal', 'CreatePlaceModal', 'PlaceDetailModal', 'BottomNav', 'ThemeToggle']
      }
    })

    await flushPromises()

    // Initial: alle Places im Stack
    expect(wrapper.vm.swipeStack).toHaveLength(2)

    // Markiere Place 1 als geswiped
    wrapper.vm.swipedIds.add(1)

    // Jetzt nur noch 1 Place im Stack
    expect(wrapper.vm.swipeStack).toHaveLength(1)
    expect(wrapper.vm.swipeStack[0].id).toBe(2)
  })

  // Test 10: openPlaceDetail öffnet Modal mit korrektem Place
  it('openPlaceDetail öffnet Modal mit korrektem Place', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: ['LandingPage', 'LoginModal', 'CreatePlaceModal', 'PlaceDetailModal', 'BottomNav', 'ThemeToggle']
      }
    })

    await flushPromises()

    const testPlace = { id: 99, name: 'Detail Test Place' }

    expect(wrapper.vm.isPlaceDetailOpen).toBe(false)
    wrapper.vm.openPlaceDetail(testPlace)

    expect(wrapper.vm.isPlaceDetailOpen).toBe(true)
    expect(wrapper.vm.selectedPlace).toEqual(testPlace)
  })
})

