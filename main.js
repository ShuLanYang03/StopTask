// trainingExplanation.js

document.addEventListener("DOMContentLoaded", function () {
    function getRandomNumber() {
        return Math.floor(Math.random() * 12); // 0 到 11（包含 11）之間的整數
    }

    const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0xff95ca,
    });
    document.body.appendChild(app.view);

    let R_count = 0;
    let L_count = 0;

    const fixpointTexture = [
        PIXI.Texture.from("stimuli/fixpoint1.png"),
        PIXI.Texture.from("stimuli/fixpoint2.png"),
        PIXI.Texture.from("stimuli/fixpoint3.png"),
    ];

    //// Create a new texture
    const textureArray = [
        PIXI.Texture.from("stimuli/frame.png"),
        PIXI.Texture.from("stimuli/leftarrow.png"),
        PIXI.Texture.from("stimuli/leftarrownogo.png"),
        PIXI.Texture.from("stimuli/rightarrow.png"),
        PIXI.Texture.from("stimuli/rightarrownogo.png"),
        PIXI.Texture.from("stimuli/wrongkey.png"),
        PIXI.Texture.from("stimuli/shouldhavepressed1.png"),
        PIXI.Texture.from("stimuli/shouldhavepressed2.png"),
        PIXI.Texture.from("stimuli/shouldhavepressed3.png"),
        PIXI.Texture.from("stimuli/shouldhavepressed4.png"),
        PIXI.Texture.from("stimuli/shouldnothavepressed1.png"),
        PIXI.Texture.from("stimuli/shouldnothavepressed2.png"),
    ];
    // Create a sprite with the texture
    const frame = new PIXI.Sprite(textureArray[1]);

    // Set the anchor to the center of the sprite
    frame.anchor.set(0.5);

    // Set the position to the center of the stage
    frame.x = app.screen.width / 2;
    frame.y = app.screen.height / 2;
    frame.scale.set(0.5);
    // Add the sprite to the container
    app.stage.addChild(frame);

    // 加入編號文字
    const indexText = new PIXI.Text("1", { fontSize: 24, fill: 0xffffff });
    indexText.x = 10;
    indexText.y = 10;
    app.stage.addChild(indexText);

    // 加入顯示文字
    const displayText = new PIXI.Text("文字", { fontSize: 24, fill: 0xffffff });
    displayText.anchor.set(0.5);
    displayText.x = app.screen.width / 2;
    displayText.y = app.screen.height / 2;
    //app.stage.addChild(displayText);

    // 加入確認按鈕
    const confirmButton_L = new PIXI.Graphics();
    confirmButton_L.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
    confirmButton_L.beginFill(0xde3249, 1);
    confirmButton_L.drawCircle(app.screen.width / 8, app.screen.height / 2, 50);
    confirmButton_L.endFill();
    confirmButton_L.interactive = true;
    confirmButton_L.buttonMode = true;
    app.stage.addChild(confirmButton_L);

    const confirmButton_R = new PIXI.Graphics();
    confirmButton_R.beginFill(0xde3249, 1);
    confirmButton_R.drawRect(
        (app.screen.width / 8) * 7 - 50,
        app.screen.height / 2 - 50,
        100,
        100
    );
    confirmButton_R.endFill();
    confirmButton_R.interactive = true;
    confirmButton_R.buttonMode = true;
    app.stage.addChild(confirmButton_R);

    // 加入確認按鈕上的文字
    // const buttonText = new PIXI.Text("確認", { fontSize: 24, fill: 0xffffff });
    // buttonText.anchor.set(0.5);
    // buttonText.x = confirmButton.x + confirmButton.width / 2;
    // buttonText.y = confirmButton.y + confirmButton.height / 2;
    //app.stage.addChild(buttonText);

    // 設定確認按鈕的點擊事件
    confirmButton_L.on("pointertap", function () {
        console.log("點擊L");
        L_count++;
        console.log(L_count);
        const randomIndex = getRandomNumber();
        frame.texture = textureArray[randomIndex];
        animateTextures(); // 在這裡觸發動畫
    });
    // 設定確認按鈕的點擊事件
    confirmButton_R.on("pointertap", function () {
        console.log("點擊R");
        R_count++;
        console.log(R_count);
        animateTextures(); // 在這裡觸發動畫
    });
    // 延遲函數
    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // 設置動畫更新
    app.ticker.add((delta) => {
        frame.rotation += 0.02;
    });
});
