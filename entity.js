var Entity = /** @class */ (function () {
    function Entity(x, y) {
        this.position = new Vector2(x, y);
        this.rotation = 0;
        this.hitTime = 0;
    }
    Entity.prototype.update = function (delta, data) { };
    Entity.prototype.render = function (ctx, mousePos) { };
    Entity.prototype.getX = function () {
        return this.position.x;
    };
    Entity.prototype.getY = function () {
        return this.position.y;
    };
    return Entity;
}());
