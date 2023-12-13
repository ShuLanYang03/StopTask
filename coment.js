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
