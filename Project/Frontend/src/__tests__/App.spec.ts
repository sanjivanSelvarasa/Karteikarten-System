import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import LandingPage from '../page/Landingpage.vue'

describe('LandingPage', () => {
  it('renders the landing page navbar and hero', () => {
    const wrapper = mount(LandingPage)

    expect(wrapper.text()).toContain('Karteikarten-System')
    expect(wrapper.text()).toContain('Projektziel')
    expect(wrapper.text()).toContain('Login')
    expect(wrapper.text()).toContain('Lernen ohne Umwege')
  })
})
