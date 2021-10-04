var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Coin = /** @class */ (function (_super) {
    __extends(Coin, _super);
    function Coin(x, y) {
        return _super.call(this, x, y) || this;
    }
    Coin.prototype.update = function (delta, player) {
        if (dist(this.position.x, this.position.y, player.position.x, player.position.y) < 50)
            return true;
        return false;
    };
    Coin.prototype.render = function (ctx) {
        ctx.drawImage(game.images["coin"], game.rpx(this.position.x) - 16, game.rpy(this.position.y) - 16, 32, 32);
    };
    return Coin;
}(Entity));
