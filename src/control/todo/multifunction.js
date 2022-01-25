
const down = store => {
    store.commit('key_ready', true)
}

let lock = false;

const up = store => {
    store.commit('key_ready', false)

    if (lock) {
        return;
    }
    lock = true;

    console.log('打开')
}

export default {
    down,
    up
}
