import { want } from "@/utils";
import event from "@/utils/event";
import states from "../states";
const down = store => {
    store.commit("key_down", true)
    if (store.state.cur !== null) {
        event.down({
            key: "down",
            begin: 40,
            interval: 40,
            callback: stopDownTrigger => {
                const state = store.state;

                // 锁定状态时不允许操作
                if (state.lock) {
                    return;
                }

                // 游戏未开始、暂停时不允许操作
                if (state.gameRoom.status != 1 ||  state.gameRoom.pause) {
                    return
                }

                // 游戏已结束
                if (state.playerData.isOver) {
                    return
                }

                // 当前不存在方块时不允许操作
                const cur = state.playerData.cur
                if (cur === null) {
                    return
                }

                const next = cur.fall();
                if (want(next, state.playerData.matrix)) {
                    store.commit("moveBlock", next);
                    states.auto();
                } else {
                    let matrix = JSON.parse(JSON.stringify(state.playerData.matrix));
                    const shape = cur.shape;
                    const xy = cur.xy;
                    shape.forEach((m, k1) =>
                        m.forEach((n, k2) => {
                            if (n && xy[0] + k1 >= 0) {
                                // 竖坐标可以为负
                                let line = matrix[xy[0] + k1];
                                line[xy[1] + k2] = 1;

                                matrix[xy[0] + k1] = line;
                            }
                        })
                    );
                    states.nextAround(matrix, stopDownTrigger);
                }
            }
        });
    } else {
        event.down({
            key: "down",
            begin: 200,
            interval: 100,
            callback: () => {
                if (store.state.lock) {
                    return;
                }
                const state = store.state;
                const cur = state.playerData.cur;
                if (cur) {
                    return;
                }
            }
        });
    }
};

const up = store => {
    store.commit("key_down", false);
    event.up({
        key: "down"
    });
};

export default {
    down,
    up
};
