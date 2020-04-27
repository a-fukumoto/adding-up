'use strict';
const fs = require('fs');
const readline = require('readline');
const rs = fs.createReadStream('./popu-pref.csv');
// read stream を入力としたIFを作成
const rl = readline.createInterface({ 'input': rs, 'output': {} });
// 人口集計用Mapオブジェクト　Key:都道府県、Value:集計データ
const prefectureDataMap = new Map();

// rlオブジェクトで「line」イベントが発生したら指定した関数を呼ぶように
// ここでの関数は無名関数
// lineが発生すると引数linestringがコンソールに出力されるイベント
rl.on('line', (lineString) => {
    //console.log(lineString);
    const columns = lineString.split(',');
    const year = parseInt(columns[0]); // 文字列→整数変換
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);
    if (year === 2010 || year === 2015) {
        let value = prefectureDataMap.get(prefecture);
        if (!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            value.popu10 = popu;
        }
        if (year === 2015) {
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);
    }
});
rl.on('close', () => {
    // for-of構文　Map,Arrayの中身をofとしてforループと同じように扱うことができる
    // MapだとKey、Valueがあるので「分割代入」という手法が使える
    for (let [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }
    // 変化率の大きいものからソートする
    // MapをArrayに変換したものに対してsortを呼び出す
    // sortには無名関数として比較関数を渡す
    // これにより並び替えルールを指定することができる
    // 比較関数は二つの変数を受け取り、
    // 一つ目の変数を二つ目の変数より前にしたい：return が負の整数
    // 二つ目の変数を一つ目の変数より前にしたい：return が正の整数
    // 順番の変更なし：return が0
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    })
    // 見やすい形に成形
    const rankingStrings = rankingArray.map(([key, value]) => {
        return key + ': ' + value.popu10 + ' -> ' + value.popu15 + ' 変化率: ' + value.change;
    });
    console.log(rankingStrings);
});