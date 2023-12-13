document.addEventListener("DOMContentLoaded", function () {
    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function getRandomNogoNumber() {
        const options = [100, 150, 200, 250, 300, 350, 400, 450];
        const randomIndex = Math.floor(Math.random() * options.length);
        return options[randomIndex];
    }
    let canpress = false;
    let sessionState = 0;
    // 產生go和nogo的序列
    const trial_num = 10;

    function generateRandomArray(mode) {
        let length = 0;
        let counts = {};

        if (mode === 1) {
            counts = { 0: 5, 1: 5 };
        } else if (mode === 2) {
            counts = { 0: 4, 1: 4, 2: 1, 3: 1 };
        } else {
            throw new Error("Invalid mode");
        }

        // 計算陣列長度
        length = Object.values(counts).reduce((sum, count) => sum + count, 0);

        // 確保長度為偶數
        if (length % 2 !== 0) {
            throw new Error("Length must be an even number");
        }

        // 生成陣列
        const initialArray = Object.entries(counts).flatMap(([value, count]) =>
            Array(count).fill(value)
        );

        // 隨機排序陣列
        const randomArray = initialArray.sort(() => Math.random() - 0.5);
        console.log(randomArray);
        return randomArray;
    }
    // 產生go和nogo的序列

    const canvas = document.getElementById("mycanvas");
    const app = new PIXI.Application({
        view: canvas,
        width: window.innerWidth,
        height: window.innerHeight,
    });
    function updateCanvasPosition() {
        // 更新 canvas 位置
        app.view.style.position = "absolute";
        app.view.style.left = `${
            (window.innerWidth - app.renderer.width) / 2
        }px`;
        app.view.style.top = `${
            (window.innerHeight - app.renderer.height) / 2
        }px`;
    }
    updateCanvasPosition();

    // LR count
    let R_count = 0;
    let L_count = 0;
    let now_input = "";
    // LR count

    // 增加 resize 事件監聽器
    window.addEventListener("resize", updateCanvasPosition);

    /* 按鈕載入現場 */
    const confirmButton_L = new PIXI.Graphics();
    confirmButton_L.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
    confirmButton_L.beginFill(0xde3249, 1);
    confirmButton_L.drawCircle(
        app.screen.width / 6,
        (app.screen.height / 7) * 6,
        50
    );
    confirmButton_L.endFill();
    confirmButton_L.interactive = true;
    confirmButton_L.buttonMode = true;

    const confirmButton_R = new PIXI.Graphics();
    confirmButton_R.beginFill(0xde3249, 1);
    confirmButton_R.drawRect(
        (app.screen.width / 7) * 6 - 50,
        (app.screen.height / 7) * 6 - 50,
        100,
        100
    );
    confirmButton_R.endFill();
    confirmButton_R.interactive = true;
    confirmButton_R.buttonMode = true;

    /* 按鈕載入現場 */
    function updateButton() {
        app.stage.addChild(confirmButton_L);
        app.stage.addChild(confirmButton_R);
    }
    // 設定確認按鈕的點擊事件
    //1、3
    confirmButton_L.on("pointertap", async function () {
        console.log("點擊L", z);

        now_input = "L";
        L_count++;
        console.log(L_count);
        // 檢查是否按錯（`canpress` 為假或 `z` 不為 1 或 3）
        if (!canpress || (z !== 1 && z !== 3)) {
            now_input = "L"; // 如果按錯，將輸入設置為 "L"
            console.log("按錯");
            killImg(); // 移除圖像
            show_wrongkey(); // 播放 "wrongkey" 圖像
        } else {
            // 按對的情況
            killImg(); // 移除圖像
            if (z === 0 || z === 1) {
                canpress = false; // 如果 `z` 為 0 或 1，將 `canpress` 設置為 false
            } else if (z === 2 || z === 3) {
                await delay(0); // 強制等待一段時間，確保 show_arrow(x); 的異步操作完成
                // 在這裡處理假警報的情況
            }
        }
        //console.log(canpress);
        //switchImg();
        const timestamp = new Date().getTime(); // 取得當前時間戳記
        console.log("Timestamp:", timestamp);
    });
    //0、2
    // 設定確認按鈕的點擊事件
    confirmButton_R.on("pointertap", async function () {
        console.log("點擊R", z);
        now_input = "R";
        R_count++;
        console.log(R_count);
        if (canpress && (z == 0 || z == 2)) {
            killImg();
            if (z === 0 || z === 1) {
                canpress = false;
            } else if (z === 2 || z === 3) {
                await delay(0); // 強制等待一下，確保 show_arrow(x); 的異步操作完成
                // 在這裡處理假警報的情況
            }
        } else {
            now_input = "R";
            console.log("按錯");
            killImg();
            show_wrongkey();
        }
        const timestamp = new Date().getTime(); // 取得當前時間戳記
        console.log("Timestamp:", timestamp);
    });

    /* 刺激載入現場 */

    let loader = PIXI.Loader.shared;
    /*指導語*/
    loader.add("instruction1", "resource/instruction1.png");
    loader.add("instruction2", "resource/instruction2.png");

    /* frame */
    loader.add("bg", "stimuli/frame.png");

    /* fixpoint */
    loader.add("fixpoint", "resource/fixpoint.json");

    /* pressButton */
    loader.add("pressButton", "resource/pressButton.json");
    /* pressButton */
    loader.add("dontPressButton", "resource/dontPressButton.json");

    /* 箭頭 */
    loader.add("arrow_R", "stimuli/rightarrow.png");
    loader.add("arrow_R_nogo", "stimuli/rightarrownogo.png");
    loader.add("arrow_L", "stimuli/leftarrow.png");
    loader.add("arrow_L_nogo", "stimuli/leftarrownogo.png");

    /* 按錯 */
    loader.add("wrongkey", "stimuli/wrongkey.png");

    /* 開始鈕 */
    loader.add("startButton", "stimuli/startButton.png");

    /* 載入資源結束 */

    loader.onProgress.add(handleLoadProgress);
    loader.onLoad.add(handleLoadAsset);
    loader.onError.add(handleLoadError);
    loader.load(handleLoadComplete);

    let isPressing = true;

    let btn = null;

    let currentImg = null;
    let img = null;

    let background = null;

    function handleLoadProgress(loader, resource) {
        console.log(loader.progress + "% loaded");
    }

    function handleLoadAsset(loader, resource) {
        console.log("asset loaded " + resource.name);
        if (resource.name === "instruction1") {
            // 當背景資源載入完成時，創建背景精靈
            background = new PIXI.Sprite(resource.texture);
            background.anchor.set(0.5); // 設置錨點在中心
            const scale = app.renderer.height / background.height;
            background.scale.set(scale);
            background.position.set(
                app.screen.width / 2,
                app.screen.height / 2
            ); // 設置位置在舞台中央
            app.stage.addChildAt(background, 0); // 將背景放到最底層
        }
    }

    function handleLoadError() {
        console.error("load error");
    }

    //開始//
    function handleLoadComplete() {
        const session1Array = generateRandomArray(1);
        const session2Array = generateRandomArray(2).concat(
            generateRandomArray(2)
        );
        startButton(session2Array);
        //session(session2Array); //go
        // session(session2Array); //nogo
    }
    // 添加點擊監聽器

    async function startButton(sArray) {
        if (btn != null) {
            app.stage.removeChild(btn);
        }
        // 當img資源載入完成時，創建img精靈
        let texture_startButton = loader.resources.startButton.texture;
        btn = new PIXI.Sprite(texture_startButton);
        await delay(1);
        btn.interactive = true;
        btn.buttonMode = true;
        btn.anchor.set(0.5); // 設置錨點在中心
        // 計算按鈕的寬度，使其等於背景物件寬度的 0.7 倍
        const buttonWidth = background.width * 0.5;
        const scale = buttonWidth / btn.width;
        btn.scale.set(scale);
        btn.position.set(app.screen.width / 2, (app.screen.height / 7) * 6); // 設置位置在舞台中下
        app.stage.addChildAt(btn, 1); //上一層

        btn.on("pointertap", async function () {
            // 在這裡處理按鈕被點擊的邏輯
            console.log("按鈕被點擊了！");
            btn.interactive = false;
            btn.buttonMode = false;
            sessionState = 1;
            if (btn != null) {
                app.stage.removeChild(btn);
            }
            session(sArray); //go
        });
    }

    function animate() {
        img.x = app.renderer.screen.width / 2;
        img.y = app.renderer.screen.height / 2;
    }

    document.addEventListener("mousedown", () => {});

    document.addEventListener("mouseup", () => {});

    function killImg() {
        canpressed = false;
        // 如果已經有現有的 img 物件，先將其從舞台中移除
        if (currentImg) {
            app.stage.removeChild(currentImg);
            currentImg = null;
        }
    }

    function show_arrow(x) {
        if (x == 0) {
            show_arrow_R_go();
        } else if (x == 1) {
            show_arrow_L_go();
        } else if (x == 2) {
            show_arrow_R_nogo();
        } else {
            show_arrow_L_nogo();
        }
    }

    let z = 0;

    async function gotrial(x) {
        z = x;
        await delay(500); // 等待500毫秒

        show_fixpoint(); // 播放
        await delay(1000); // 等待播放結束
        canpress = true; // 設定可以被按下

        // 設定一個監聽器，當按下 confirmButton_L 時呼叫 killImg 並中斷 show_arrow(x)
        const killListener = () => {
            killImg();
            canpress = false;
            confirmButton_L.off("pointertap", killListener); // 移除監聽器，以免重複觸發
            confirmButton_R.off("pointertap", killListener);
        };
        confirmButton_L.on("pointertap", killListener);
        confirmButton_R.on("pointertap", killListener);

        show_arrow(x); // 播放
        await delay(500); // 等待播放結束
        confirmButton_L.off("pointertap", killListener); // 確保最後移除監聽器
        confirmButton_R.off("pointertap", killListener); // 確保最後移除監聽器

        // 在這裡處理 show_pressButton 的情況
        if (canpress) {
            show_pressButton();
            canpress = false; // 在這裡設置 canpress 為 false
            await delay(2000);
        }
    }
    // async function gotrial(x) {
    //     z = x;
    //     await delay(500); // 等待500毫秒
    //     show_fixpoint(); //播放
    //     await delay(1000); //等待播放結束
    //     canpress = true; //設定可以被按下
    //     show_arrow(x); //播放
    //     await delay(500); //等待播放結束
    //     //如果被按下會是false，沒按則是true
    //     if (canpress) {
    //         canpress = false;
    //         console.log("123456767");
    //         show_pressButton();
    //         await delay(2000);
    //     } else {
    //         return;
    //     }
    // }
    // async function nogotrial(x) {
    //     z = x - 2;
    //     const iti = getRandomNogoNumber();
    //     await delay(500); // 等待500毫秒
    //     show_fixpoint(); // 播放
    //     await delay(1000); // 等待播放結束
    //     canpress = true; // 設定可以被按下
    //     show_arrow(x - 2); // 播放
    //     const diff = 500 - iti;
    //     await delay(iti); // 等待播放結束
    //     if (!canpress) {
    //         console.log("fake!");
    //         return;
    //     }
    //     z = x;
    //     show_arrow(x); // 播放
    //     await delay(diff);

    //     if (!canpress) {
    //         show_dontPressButton();
    //         canpress = false; // 在這裡設置 canpress 為 false
    //         await delay(2000);
    //     }
    // }
    async function nogotrial(x) {
        z = x - 2;
        const iti = getRandomNogoNumber();
        await delay(500); // 等待500毫秒
        show_fixpoint(); // 播放
        await delay(1000); // 等待播放結束
        canpress = true; // 設定可以被按下

        // 設定一個監聽器，當按下 confirmButton_L 時呼叫 killImg 並中斷 show_arrow(x - 2)
        const killListener = () => {
            killImg();
            canpress = false;
            confirmButton_L.off("pointertap", killListener); // 移除監聽器，以免重複觸發
            confirmButton_R.off("pointertap", killListener); // 移除監聽器，以免重複觸發
        };
        confirmButton_L.on("pointertap", killListener);
        confirmButton_R.on("pointertap", killListener);

        show_arrow(x - 2); // 播放
        const diff = 500 - iti;
        await delay(iti); // 等待播放結束

        // 在這裡處理 fake 的情況
        if (!canpress) {
            console.log("fake!");
            return;
        }

        z = x;
        show_arrow(x); // 播放
        await delay(diff);
        confirmButton_L.off("pointertap", killListener); // 確保最後移除監聽器
        confirmButton_R.off("pointertap", killListener); // 確保最後移除監聽器
        // 在這裡處理 show_dontPressButton 的情況
        if (!canpress) {
            show_dontPressButton();
            canpress = false; // 在這裡設置 canpress 為 false
            await delay(2000);
        }
    }

    /* session */
    async function session(sArray) {
        show_bg();
        updateButton();
        await delay(3000);
        for (let i = 0; i < trial_num; i++) {
            let x = sArray[i];
            if (x == 0 || x == 1) {
                await gotrial(x);
            } else {
                await nogotrial(x);
            }
        }
    }

    /*動畫*/

    function checkIfAnime() {
        if (img instanceof PIXI.AnimatedSprite) {
            // img 是 AnimatedSprite 的實例
            stop_Anime(img);
        } else {
            // img 不是 AnimatedSprite 的實例
        }
    }

    function stop_Anime(img) {
        img.loop = false;
        img.stop();
    }

    function init_Anime(img, speed) {
        // 如果已經有現有的 img 物件，先將其從舞台中移除
        if (currentImg) {
            app.stage.removeChild(currentImg);
        }

        // 設定新的 img 物件
        currentImg = img;

        img.scale.set(0.2);
        img.x = app.renderer.screen.width / 2;
        img.y = app.renderer.screen.height / 2;
        img.anchor.x = 0.5;
        img.anchor.y = 0.5;
        app.stage.addChild(img);

        img.animationSpeed = speed;
        img.loop = false;
        img.play();

        img.onLoop = () => {
            console.log("loop");
        };
        img.onFrameChange = () => {
            console.log("currentFrame", img.currentFrame, currentImg);
        };
        img.onComplete = () => {
            killImg();
            console.log("done");
        };

        app.ticker.add(animate);
    }

    function show_fixpoint() {
        // fixpoint
        let texture_fixpoint = loader.resources.fixpoint.spritesheet;
        img = new PIXI.AnimatedSprite(texture_fixpoint.animations.fixpoint);
        init_Anime(img, 0.1);
    }

    function show_pressButton() {
        // pressButton
        let texture_pressButton = loader.resources.pressButton.spritesheet;
        img = new PIXI.AnimatedSprite(
            texture_pressButton.animations.shouldhavepressed
        );
        init_Anime(img, 0.05);
    }

    function show_dontPressButton() {
        console.log("dontPressButton");
        // dontPressButton
        let texture_pressButton = loader.resources.dontPressButton.spritesheet;
        img = new PIXI.AnimatedSprite(
            texture_pressButton.animations.shouldnothavepressed
        );
        init_Anime(img, 0.05);
    }

    /*圖像*/
    function show_bg() {
        if (background != null) {
            app.stage.removeChild(background);
        }
        // bg
        let texture_bg = loader.resources.bg.texture;
        background = new PIXI.Sprite(texture_bg);
        background.anchor.set(0.5); // 設置錨點在中心
        background.scale.set(0.2);
        background.position.set(app.screen.width / 2, app.screen.height / 2); // 設置位置在舞台中央
        app.stage.addChildAt(background, 0); // 將背景放到最底層
    }

    function init_Img(img) {
        // 如果已經有現有的 img 物件，先將其從舞台中移除
        if (currentImg) {
            app.stage.removeChild(currentImg);
        }

        // 設定新的 img 物件
        currentImg = img;

        img.scale.set(0.2);
        img.x = app.renderer.screen.width / 2;
        img.y = app.renderer.screen.height / 2;
        img.anchor.x = 0.5;
        img.anchor.y = 0.5;
        app.stage.addChild(img);
    }

    function show_arrow_R_go() {
        // R
        let texture_right = loader.resources.arrow_R.texture;
        img = new PIXI.Sprite(texture_right);
        init_Img(img);
    }
    function show_arrow_R_nogo() {
        // R_nogo
        let texture_right_nogo = loader.resources.arrow_R_nogo.texture;
        img = new PIXI.Sprite(texture_right_nogo);
        init_Img(img);
    }
    function show_arrow_L_go() {
        // L
        let texture_left = loader.resources.arrow_L.texture;
        img = new PIXI.Sprite(texture_left);
        init_Img(img);
    }

    function show_arrow_L_nogo() {
        // L_nogo
        let texture_left_nogo = loader.resources.arrow_L_nogo.texture;
        img = new PIXI.Sprite(texture_left_nogo);
        init_Img(img);
    }
    function show_wrongkey() {
        // wrongkey
        let texture_wrongkey = loader.resources.wrongkey.texture;
        img = new PIXI.Sprite(texture_wrongkey);
        init_Img(img);
    }

    function switchImg() {
        checkIfAnime();
        if (isPressing == true) {
            isPressing = false;
            show_dontPressButton(); // 開始 pressButton 動畫
        } else {
            isPressing = true;
            show_arrow_L_nogo();
        }
    }
});
