import { Toast } from "vant";

// 设置页面title
export const set_documment_title = (title) => {
    title = title || '';
    document.title = `${title} | 俄罗斯方块 Online`;
};

// loading
export const loading = (message = '', options = {}) => {
    Toast.loading({
        forbidClick: true,
        loadingType: 'spinner',
        overlay: true,
        duration: 0,
        message,
        ...options
    })
}

// unloading
export const unloading = () => {
    Toast.clear()
}