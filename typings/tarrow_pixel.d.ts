declare module "*tarrow_pixel.node" {
    /**
     * 返回鼠标所在位置的像素
     * @param x 鼠标x轴位置
     * @param y 鼠标y轴位置
     */
    export function getPixel(x: number, y: number): number;
}