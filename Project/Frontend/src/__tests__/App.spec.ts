import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import LandingPage from '../page/Landingpage.vue'

describe('LandingPage', () => {
  it('renders the landing page navbar and hero', () => {
    const wrapper = mount(LandingPage)

    expect(wrapper.text()).toContain('StudyDeck')
    expect(wrapper.text()).toContain('Digitale Karteikarten')
    expect(wrapper.text()).toContain('Einloggen')
    expect(wrapper.text()).toContain('Lerne smarter')
  })
})
