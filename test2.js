document.addEventListener("DOMContentLoaded", function () {
    /* canvas相關 */
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
    // 增加 resize 事件監聽器
    window.addEventListener("resize", updateCanvasPosition);
    /* canvas相關 */

    /* debug用的函式們*/
    async function consoleAsync(str1) {
        console.log(str1);
    }
    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /* debug用的函式們*/

    /* 刺激載入現場 */
    let loader = PIXI.Loader.shared;
    loadImageResource(loader);
    /* 刺激載入現場 */

    /* 定義環境變數 */
    let isPressing = true; //是在按
    let btn = null; //按鈕
    let currentImg = null; //現在的圖片
    let img = null; //真正在場上的圖片
    let background = null; //背景
    let canpress = false;
    let sessionState = 0;
    let wrongkey = false;
    const summaryArray = [];

    //8個詭異數字
    let stopSignalAppearTime = 0;
    let firstResponseTime = 0;
    let firstResponseStatus = 0;
    let secondResponseTime = 0;
    let secondResponseStatus = 0;
    //8個詭異數字
    let responseTime = 0;
    let sessionEnd = false; //給第一階段用的，目的是檢測是否 (>正確20題目) || (題目>20 && 反應時間< 500)

    // LR count
    let R_count = 0;
    let L_count = 0;
    let now_input = "";
    // LR count
    let z = 0; //我是決定目前到底是哪邊的(0,1,2,3)
    //z = 0 右邊

    // 生成隨機專屬代碼
    const randomString = generateRandomString();
    let showArrowTime = 0;
    let arrowPressTime = 0;

    /* 環境變數 */

    function loadImageResource(loader) {
        /*指導語*/
        loader.add("instruction1", "resource/instruction1.png");
        loader.add("instruction2", "resource/instruction2.png");
        loader.add("instruction3", "resource/instruction3.png");

        /* frame */
        loader.add("frame", "stimuli/frame.png");

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

        /* 結束鈕 */
        loader.add("endButton", "stimuli/endButton.png");

        /* 載入資源結束 */

        loader.onProgress.add(handleLoadProgress);
        loader.onLoad.add(handleLoadAsset);
        loader.onError.add(handleLoadError);
        loader.load(handleLoadComplete);
    }

    /* Loader呼叫的東西 */
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
    async function handleLoadComplete() {
        updateCanvasPosition();
        const session1Array = generateRandomArray(1);
        // console
        await startButton(session1Array);
        // show_bg();
        // session(session2Array); //go
        // session(session2Array); //nogo
    }
    /* Loader呼叫的東西 */

    /* 按鈕載入現場 */
    const circleRadius = Math.sqrt((100 * 100) / Math.PI);

    const confirmButton_L = new PIXI.Graphics();
    confirmButton_L.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
    confirmButton_L.beginFill(0xde3249, 1);
    confirmButton_L.drawCircle(
        app.screen.width / 6,
        (app.screen.height / 7) * 6,
        circleRadius
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

    // 設定確認按鈕的點擊事件
    //1、3
    confirmButton_L.on("pointertap", async function () {
        console.log("點擊L", z);
        /* 秒數在這 */
        // 算秒數
        arrowPressTime = new Date().getTime();
        console.log("arrowPressTime: " + arrowPressTime);
        // 計算時間差
        const timeDifference = arrowPressTime - showArrowTime;
        console.log("時間差（毫秒）:", timeDifference);

        now_input = "L";
        // L_count++;
        // console.log("Lcount" + L_count);

        /* 邏輯在這 */
        // 檢查是否按對
        if (canpress && (z == 1 || z == 3)) {
            console.log("1canpress: " + canpress + "z: " + z);
            killImg(); // 移除圖像
            if (z === 0 || z === 1) {
                canpress = false; // 如果 `z` 為 0 或 1，將 `canpress` 設置為 false
            } else if (z === 2 || z === 3) {
                await delay(0); // 強制等待一段時間，確保 show_arrow(x); 的異步操作完成
                // 在這裡處理假警報的情況
            }
        } else if (canpress && (z == 0 || z == 2)) {
            //按錯的情況
            if (canpress) {
                //killImg();
                console.log("2canpress: " + canpress + "z: " + z);
                console.log("按錯(答案是右邊方形)");
                canpress = false; //把canpress關掉
                wrongkey = true; //按錯要等
                //show_wrongkey(); // 播放 "wrongkey" 圖像
                await consoleAsync("test");
            }
        }
    });
    //0、2
    // 設定確認按鈕的點擊事件
    confirmButton_R.on("pointertap", async function () {
        console.log("點擊L", z);
        /* 秒數在這 */
        // 算秒數
        arrowPressTime = new Date().getTime();
        console.log("arrowPressTime: " + arrowPressTime);
        // 計算時間差
        const timeDifference = arrowPressTime - showArrowTime;
        console.log("時間差（毫秒）:", timeDifference);

        now_input = "R";
        // R_count++;
        // console.log("Rcount" + R_count);

        /* 邏輯在這 */
        // 檢查是否按對
        if (canpress && (z == 0 || z == 2)) {
            console.log("1canpress: " + canpress + "z: " + z);
            killImg(); // 移除圖像
            if (z === 0 || z === 1) {
                canpress = false; // 如果 `z` 為 0 或 1，將 `canpress` 設置為 false
            } else if (z === 2 || z === 3) {
                await delay(0); // 強制等待一段時間，確保 show_arrow(x); 的異步操作完成
                // 在這裡處理假警報的情況
            }
        } else if (canpress && (z == 1 || z == 3)) {
            //按錯的情況
            if (canpress) {
                //killImg();
                console.log("2canpress: " + canpress + "z: " + z);
                console.log("按錯(答案是左邊圓形)");
                canpress = false; //把canpress關掉
                wrongkey = true; //按錯要等
                //show_wrongkey(); // 播放 "wrongkey" 圖像
                await consoleAsync("test");
            }
        }
    });

    /* 複製按鈕在這 */
    // 創建按鈕
    async function show_copy_button() {
        if (btn != null) {
            app.stage.removeChild(btn);
            app.stage.removeChildren();
        }
        // 當img資源載入完成時，創建img精靈
        let texture_endButton = loader.resources.endButton.texture;
        show_bg(3);
        btn = new PIXI.Sprite(texture_endButton);
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
        console.log(summaryArray);

        btn.on("pointertap", async function () {
            // 在這裡處理按鈕被點擊的邏輯
            console.log(randomString);
            copyToClipboard(randomString);
        });
    }
    // 複製到剪貼簿的函數
    function copyToClipboard(text) {
        var textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        // 在這裡設置你想要打開的網頁的URL
        //var url = "https://www.example.com";
        let url = "https://forms.gle/bfgYtCV8MTSVfmcc9";
        // 使用 window.open 開啟新的網頁
        window.open(url, "_blank");
    }

    /* 左右按鈕載入現場 */
    function updateButton() {
        app.stage.addChild(confirmButton_L);
        app.stage.addChild(confirmButton_R);
    }
    /* 左右按鈕載入現場 */

    /* session1 和 session2 開始按鈕載入現場 */
    async function startButton(sArray) {
        if (btn != null) {
            app.stage.removeChild(btn);
            app.stage.removeChildren();
        }
        // 當img資源載入完成時，創建img精靈
        let texture_startButton = loader.resources.startButton.texture;
        // texture_startButton = loader.resources.Button.texture;

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
            showArrowTime = new Date().getTime();
            arrowPressTime = new Date().getTime();
            await session(sArray); //go
            sessionState = 2;
            if (sessionState == 2) {
                show_bg(2);
                await consoleAsync("session1");
                await show_secondButton();
            }
            //show_wrongkey();
        });
    }

    async function show_secondButton() {
        if (btn != null) {
            app.stage.removeChild(btn);
            app.stage.removeChildren();
        }
        show_bg(3);
        // 當img資源載入完成時，創建img精靈
        let texture_startButton = loader.resources.startButton.texture;
        // texture_startButton = loader.resources.Button.texture;
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
        show_text();

        btn.on("pointertap", async function () {
            // 在這裡處理按鈕被點擊的邏輯
            console.log("按鈕被點擊了！");
            btn.interactive = false;
            btn.buttonMode = false;
            sessionState = 2;
            if (btn != null) {
                app.stage.removeChild(btn);
            }
            clearAll();
            show_thirdButton();
            //show_wrongkey();
        });
    }
    async function show_thirdButton() {
        if (btn != null) {
            app.stage.removeChild(btn);
            app.stage.removeChildren();
        }
        show_bg(2);
        // 當img資源載入完成時，創建img精靈
        let texture_startButton = loader.resources.startButton.texture;
        // texture_startButton = loader.resources.Button.texture;
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

        // 傳資料

        btn.on("pointertap", async function () {
            // 在這裡處理按鈕被點擊的邏輯
            console.log("按鈕被點擊了！");
            btn.interactive = false;
            btn.buttonMode = false;
            sessionState = 2;
            if (btn != null) {
                app.stage.removeChild(btn);
            }
            let sArray = generateRandomArray(2).concat(generateRandomArray(2));
            showArrowTime = new Date().getTime();
            arrowPressTime = new Date().getTime();
            await session(sArray); //go
            sessionState = 3;
            if (sessionState == 3) {
                //show_text();
                clearAll();
                requestData(summaryArray);
                show_copy_button();
            }
            //show_wrongkey();
        });
    }

    /* 判斷題目的邏輯 */
    function judgment_type(x) {
        if (x == 0) {
            return ["GO", "right"];
        } else if (x == 1) {
            return ["GO", "left"];
        } else if (x == 2) {
            return ["NOGO", "right"];
        } else {
            return ["NOGO", "left"];
        }
    }

    /* 判斷最終裁決 */
    function judgment_ALL(goNogo, status1, status2) {
        if (goNogo == "GO") {
            // GO 狀態
            if (status1 === 1 && status2 === -1) {
                return 1; // 第一次正確，第二次-1，總結正確1
            } else if (status1 === 0 && status2 === -1) {
                return 0; // 第一次錯誤，第二次-1，總結錯誤0
            } else if (status1 === 2 && status2 === -1) {
                return 0; // 第一次超時，第二次-1，總結錯誤0
            }
        } else if (goNogo == "NOGO") {
            // NOGO 狀態
            if (status1 === 1 && status2 === 1) {
                return 2; // 第一次正確，第二次正確，總結假警報2
            } else if (status1 === 0 && status2 === 0) {
                return 2; // 第一次錯誤，第二次錯誤，總結假警報2
            } else if (status1 === 2 && status2 === 1) {
                return 0; // 第一次超時，第二次正確，總結錯誤0
            } else if (status1 === 2 && status2 === 0) {
                return 0; // 第一次超時，第二次錯誤，總結錯誤0
            } else if (status1 === 2 && status2 === 2) {
                return 1; // 第一次超時，第二次超時，總結正確1
            }
        }

        // 如果沒有符合的情況，返回特殊狀況 -1
        return -1;
    }

    function init_trial_value() {
        now_input = "";
        canpress = false;
        responseTime = 0;
        stopSignalAppearTime = 0;
        firstResponseTime = 0;
        firstResponseStatus = 0;
        secondResponseTime = 0;
        secondResponseStatus = -1;
    }

    /* go 和 nogo 的邏輯 */
    async function gotrial(x) {
        //初始化避免雜質
        init_trial_value();
        //傳值進來，一個trail一次處理!
        z = x;
        await delay(500); // 等待500毫秒

        show_fixpoint(); // 播放
        await delay(1000); // 等待播放結束

        // 設定一個監聽器，當按下 confirmButton_L 時呼叫 killImg 並中斷 show_arrow(x)
        const killListener = () => {
            killImg();
            canpress = false;
            confirmButton_L.off("pointertap", killListener); // 移除監聽器，以免重複觸發
            confirmButton_R.off("pointertap", killListener);
        };
        confirmButton_L.on("pointertap", killListener);
        confirmButton_R.on("pointertap", killListener);

        showArrowTime = new Date().getTime();
        console.log("!_!showArrowTime: " + showArrowTime);
        show_arrow(x); // 播放
        canpress = true; // 設定可以被按下
        await delay(500); // 等待播放結束
        confirmButton_L.off("pointertap", killListener); // 確保最後移除監聽器
        confirmButton_R.off("pointertap", killListener); // 確保最後移除監聽器

        // 在這裡處理 show_pressButton 的情況
        //沒按canpress就會是True
        if (canpress) {
            show_pressButton();
            firstResponseTime = 500;
            canpress = false; // 在這裡設置 canpress 為 false
            await delay(1500);
        } else {
            const pressArrowTime = arrowPressTime;
            const responseTime = pressArrowTime - showArrowTime;
            console.log("!_!pressArrowTime: " + pressArrowTime);
            console.log("!_!responseTime: " + responseTime);
            firstResponseTime = responseTime;
        }
        //嘗試處理wrongkey等待
        if (wrongkey) {
            show_wrongkey();
            wrongkey = false; //關回去
            await delay(1500);
        }
    }
    async function nogotrial(x) {
        //初始化避免雜質
        init_trial_value();
        //傳值進來，一個trail一次處理!
        z = x - 2;
        //減2是因為背刺仔是突然出現的
        const iti = getRandomNogoNumber();
        stopSignalAppearTime = iti;
        await delay(500); // 等待500毫秒
        show_fixpoint(); // 播放
        await delay(1000); // 等待播放結束

        // 設定一個監聽器，當按下 confirmButton_L 時呼叫 killImg 並中斷 show_arrow(x - 2)
        const killListener = () => {
            killImg();
            canpress = false;
            confirmButton_L.off("pointertap", killListener); // 移除監聽器，以免重複觸發
            confirmButton_R.off("pointertap", killListener); // 移除監聽器，以免重複觸發
        };
        confirmButton_L.on("pointertap", killListener);
        confirmButton_R.on("pointertap", killListener);

        showArrowTime = new Date().getTime();
        console.log("showArrowTime: " + showArrowTime);
        show_arrow(x - 2); // 播放
        canpress = true; // 設定可以被按下
        const diff = 500 - iti;
        await delay(iti); // 等待播放結束

        // 在這裡處理 fake 的情況
        // 代表我偷按了!(canpress變成false)
        if (wrongkey) {
            show_wrongkey();
            wrongkey = false; //關回去
            await delay(1500);
            //先假設都按錯
        } else {
        }
        if (!canpress) {
            //按了就直接回老家了
            console.log("fake!");
            const fakeArrowTime = arrowPressTime;
            const fakeResponseTime = fakeArrowTime - showArrowTime;
            console.log("!_!fakeArrowTime: " + fakeArrowTime);
            console.log("!_!fakeResponseTime: " + fakeResponseTime);
            firstResponseTime = fakeResponseTime;
            if (wrongkey) {
                firstResponseTime -= 1500;
            }
            secondResponseStatus = firstResponseStatus;
            secondResponseTime = firstResponseTime;

            return;
        }
        //這邊開始播放真正的紅色箭頭
        z = x;
        showArrowTime = new Date().getTime();
        show_arrow(x); // 播放

        //這裡處理R1_timeout邏輯
        firstResponseTime = iti;
        secondResponseStatus = 0;
        //這裡處理R1_timeout邏輯
        console.log("!_!" + wrongkey + "!_!" + canpress);
        await delay(diff);
        confirmButton_L.off("pointertap", killListener); // 確保最後移除監聽器
        confirmButton_R.off("pointertap", killListener); // 確保最後移除監聽器
        // 在這裡處理 show_dontPressButton 的情況
        if (!canpress) {
            //按了就是responcetime
            //這代表他不該按，那會有一個反應時間:)
            const pressArrowTime = arrowPressTime;
            secondResponseTime = pressArrowTime - showArrowTime;
            show_dontPressButton();
            canpress = false; // 在這裡設置 canpress 為 false
            await delay(1500);
        } else {
            //沒按就是timeout+diff
            firstResponseStatus = 2;
            secondResponseStatus = 2;
            secondResponseTime = diff;
        }

        //嘗試處理wrongkey等待
        if (wrongkey) {
            wrongkey = false; //關回去
            //原本是正確所以改成錯的
            secondResponseStatus = 0;
        } else {
            if (!canpress) {
                secondResponseStatus = 1;
            }
        }
    }

    /* session邏輯在這 */
    async function session(sArray) {
        console.log("sessionstart");
        const trial_num = sArray.length; // 將 trial_num 設置為 sArray 的長度
        show_frame();
        updateButton();
        await delay(3000);
        for (let i = 0; i < trial_num; i++) {
            let x = sArray[i];
            if (x == 0 || x == 1) {
                await gotrial(x);
            } else {
                await nogotrial(x);
            }
            //trialType
            const result_T = judgment_type(x);
            const goType = result_T[0];
            const responseSide = result_T[1];

            if (goType == "GO") {
                if (firstResponseTime < 500) {
                    firstResponseStatus = 1;
                    if (responseSide == "right" && now_input == "L") {
                        firstResponseStatus = 0;
                    } else if (responseSide == "left" && now_input == "R") {
                        firstResponseStatus = 0;
                    }
                } else {
                    firstResponseStatus = 2;
                }
            }

            const overallCorrect = judgment_ALL(
                goType,
                firstResponseStatus,
                secondResponseStatus
            );

            let s =
                "!_!\ntrialType : " +
                goType +
                "\n" +
                "requiredResponse : " +
                responseSide +
                "\n" +
                "stopSignalAppearTime : " +
                stopSignalAppearTime +
                "\n" +
                "firstResponseTime : " +
                firstResponseTime +
                "\n" +
                "firstResponseStatus : " +
                firstResponseStatus +
                "\n" +
                "secondResponseTime : " +
                secondResponseTime +
                "\n" +
                "secondResponseStatus : " +
                secondResponseStatus +
                "\n" +
                "overallCorrect : " +
                overallCorrect;
            const result = [
                goType,
                responseSide,
                stopSignalAppearTime,
                firstResponseTime,
                firstResponseStatus,
                secondResponseTime,
                secondResponseStatus,
                overallCorrect,
            ];
            summaryArray.push(result);
            await consoleAsync(s);
            init_trial_value();
        }
        console.log("sessionend");
        killImg();
        clearAll();
    }

    /* 動畫處理 */
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

    function animate() {
        img.x = app.renderer.screen.width / 2;
        img.y = app.renderer.screen.height / 2;
    }

    function checkIfAnime() {
        if (img instanceof PIXI.AnimatedSprite) {
            // img 是 AnimatedSprite 的實例
            // 這個是為了停止播放圖片和播放動畫時造成的問題
            stop_Anime(img);
        } else {
            // img 不是 AnimatedSprite 的實例
        }
    }
    /*  */

    /* 圖像處理 */
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

    /* 清道夫裝置 */

    /* 清空場上一切 */
    function clearAll() {
        //這個會把精靈給消失，要就要重新去let一個
        app.stage.removeChildren();
    }
    /* 專清中間那個動畫 */
    function killImg() {
        canpressed = false;
        // 如果已經有現有的 img 物件，先將其從舞台中移除
        if (currentImg) {
            app.stage.removeChild(currentImg);
            currentImg = null;
        }
    }
    /* 清道夫裝置 */

    // 動畫
    /* 大十字小十字 */
    function show_fixpoint() {
        // fixpoint
        let texture_fixpoint = loader.resources.fixpoint.spritesheet;
        img = new PIXI.AnimatedSprite(texture_fixpoint.animations.fixpoint);
        //let speed = total_frames / (desired_time * 60)
        let speed = 5 / (0.5 * 60);
        init_Anime(img, speed);
    }

    /* 你應該按 */
    function show_pressButton() {
        // pressButton
        let texture_pressButton = loader.resources.pressButton.spritesheet;
        img = new PIXI.AnimatedSprite(
            texture_pressButton.animations.shouldhavepressed
        );
        //let speed = total_frames / (desired_time * 60)
        let speed = 4 / (1.5 * 60);
        init_Anime(img, speed);
    }

    /* 你不該按 */
    function show_dontPressButton() {
        console.log("dontPressButton");
        // dontPressButton
        let texture_pressButton = loader.resources.dontPressButton.spritesheet;
        img = new PIXI.AnimatedSprite(
            texture_pressButton.animations.shouldnothavepressed
        );
        //let speed = total_frames / (desired_time * 60)
        let speed = 4 / (1.5 * 60);
        init_Anime(img, speed);
    }
    //圖像

    /* 背景 */
    async function show_bg(i) {
        if (background != null) {
            app.stage.removeChild(background);
        }
        // bg
        let texture_bg = loader.resources.instruction1.texture;
        if (i == 2) {
            texture_bg = loader.resources.instruction2.texture;
        } else if (i == 3) {
            texture_bg = loader.resources.instruction3.texture;
        }
        background = new PIXI.Sprite(texture_bg);
        background.anchor.set(0.5); // 設置錨點在中心
        const scale = app.renderer.height / background.height;
        background.scale.set(scale);
        background.position.set(app.screen.width / 2, app.screen.height / 2); // 設置位置在舞台中央
        app.stage.addChildAt(background, 0); // 將背景放到最底層
    }

    /* 圓框 */
    function show_frame() {
        if (background != null) {
            app.stage.removeChild(background);
        }
        // bg
        let texture_frame = loader.resources.frame.texture;
        background = new PIXI.Sprite(texture_frame);
        background.anchor.set(0.5); // 設置錨點在中心
        background.scale.set(0.2);
        background.position.set(app.screen.width / 2, app.screen.height / 2); // 設置位置在舞台中央
        app.stage.addChildAt(background, 0); // 將背景放到最底層
    }

    // 處理圖像邏輯 //
    function show_arrow(x) {
        // 0 是右 GO (正方) 1 是左 GO (正方)
        // 2 是右NOGO(正方) 3 是左NOGO(正方)
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

    /*
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
    */

    // 最後的顯示文本
    function show_text() {
        // 文本內容
        let textContent = "您的平均反應速度為\n" + "test";
        "ms\n您的專屬代碼為\n" + randomString + "\n點選按鈕複製代碼至問卷表單";

        // 創建PIXI.js Text對象
        const text = new PIXI.Text(textContent, {
            fontSize: 70,
            fill: 0xffffff,
            align: "center",
            wordWrap: true,
            wordWrapWidth: 400, // 文本寬度，超過這個寬度會換行
        });
        // 設置文本的位置
        text.anchor.set(0.5);
        text.position.set(app.screen.width / 2, app.screen.height / 2); // 設置位置在舞台中央
        // 將文本添加到PIXI場景
        app.stage.addChildAt(text, 1);
    }

    /* 隨機字串區 */
    function generateRandomString() {
        // 取得當天時間的基數
        const baseNumber = new Date().getTime();

        // 生成前4個字母
        const firstFourLetters = baseNumber
            .toString(36)
            .slice(-5)
            .toUpperCase();

        // 生成後2個字母
        const randomLetters = generateRandomLetters(2);

        // 組合字串
        const randomString = firstFourLetters + randomLetters;

        return randomString;
    }

    function generateRandomLetters(length) {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let result = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    }

    /* Go和NoGo的序列順序時間邏輯 */
    //這是nogo出現的時間表
    function getRandomNogoNumber() {
        const options = [100, 150, 200, 250, 300, 350, 400, 450];
        const randomIndex = Math.floor(Math.random() * options.length);
        return options[randomIndex];
    }

    //這是生成順序
    function generateRandomArray(mode) {
        let length = 0;
        let counts = {};

        if (mode === 1) {
            counts = { 0: 20, 1: 20 };
        } else if (mode === 2) {
            counts = { 0: 15, 1: 15, 2: 10, 3: 10 };
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

    /* Go和NoGo的序列順序時間邏輯 */

    /* 資料送出 */
    function requestData(dataArray) {
        let SHEET_URL =
            "https://script.google.com/macros/s/AKfycbxFG9o_iGUXvCfOGVi_VZdXsbe4_g3X_WYGwP-VgS7IpMld9Pmx7oN4Yfje6r1PH48/exec";
        const jsonData = JSON.stringify(dataArray);

        fetch(SHEET_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: jsonData,
        })
            .then((response) => response.text())
            .then((data) => {
                console.log("Success:", data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
});
