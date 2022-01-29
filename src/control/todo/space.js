import { want } from "@/utils";
import event from "@/utils/event";
import states from "../states";
import { music } from '@/utils/music';

const down = store => {
    store.commit("key_drop", true);
    event.down({
        key: "space",
        once: true,
        callback: () => {
            const state = store.state;

            music.fall()

            // 锁定状态时不允许操作
            if (state.lock) {
                return;
            }

            // 游戏未开始时不允许操作
            if (state.gameRoom.status != 1) {
                return
            }

            // 当前不存在方块时不允许操作
            const cur = state.playerData.cur
            if (cur === null) {
                return
            }

            // 当前方块一直垂直下落
            let index = 0;
            let bottom = cur.fall(index);
            while (want(bottom, state.playerData.matrix)) {
                bottom = cur.fall(index);
                index++;
            }
            let matrix = JSON.parse(JSON.stringify(state.playerData.matrix));
            bottom = cur.fall(index - 2);
            store.commit("moveBlock", bottom);

            // 当前方块融入到矩阵中
            const shape = bottom.shape;
            const xy = bottom.xy;
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

            // 触发抖动
            store.commit("drop", true);
            setTimeout(() => {
                store.commit("drop", false);
            }, 100);

            // 下一个方块准备出现
            states.nextAround(matrix);
        }
    });
};

const up = store => {
    store.commit("key_drop", false);
    event.up({
        key: "space"
    });
};

export default {
    down,
    up
};
