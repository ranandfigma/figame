// Since we are only supporting *axis-aligned* frames as programmable for now,
// this is sufficient. Ideally we'd want some ellipse collision code, but this
// is apparently really hard to get right. Non axis-aligned rectangles can
// behave pretty weirdly here.
//
// Note: y increases as you go down.

export class AxisAlignedGameRectangle {
    constructor(
        private x1: number,
        private y1: number, // top left corner
        private x2: number,
        private y2: number, // bottom right corner
    ) {
    }

    static fromFrameNode(node: FrameNode): AxisAlignedGameRectangle {
        const box = node.absoluteBoundingBox;
        if (!box) {
            throw new Error('no bounding bxo');
        }
        return new AxisAlignedGameRectangle(
            box.x,
            box.y,
            box.x + box.width,
            box.y + box.height,
        )
    }

    width() {
        return this.x2 - this.x1;
    }

    height() {
        return this.y2 - this.y1;
    }

    inCollision(other: AxisAlignedGameRectangle): boolean {
        const x = this.x1;
        const y = this.y1;
        const otherX = other.x1;
        const otherY = other.y1;

        if (
            x < otherX + other.width() &&
            x + this.width() > otherX &&
            y < otherY + other.height() &&
            y + this.height() > otherY
        ) {
            return true;
        }

        return false
    }

}
