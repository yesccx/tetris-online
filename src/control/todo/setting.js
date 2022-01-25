
const down = store => {
    store.commit('key_setting', true)
}

const up = store => {
    store.commit('key_setting', false)
}

export default {
    down,
    up
}
