const cheerio = require("cheerio");
const cheerioTableparser = require("cheerio-tableparser");
const foodDataFetcher = require("./foodDataFetcher");

function removeT(str) {
  return str.replace(/\t/g, "");
}

function removeNT(str) {
  return str.replace(/\t/g, "").replace(/\n/g, "");
}

function parseTable(body, date) {
  const $ = cheerio.load(body);
  cheerioTableparser($);

  let parsedTable = [];
  $(".tbl_food_list").each(function(i) {
    if (i === date) parsedTable = $(this).parsetable(true, true, true);
  });
  //서호관은 가격 등재가 파싱하기 매우 까다로우며, 가격 나열이 의미 없어보여 일단 제외함.

  return parsedTable[2];
}

function tableRowToObject(table, row) {
  const mealTime = ["점심", "스낵", "저녁"];

  return [
    {
      kitchen: mealTime[row],
      meal: removeT(table[row]),
      price: null
    }
  ];
}

async function getParsedTable() {
  const body = await foodDataFetcher.fetchSeohoData();
  const todayDay = new Date().getDay() - 1;
  return parseTable(body, todayDay);
}

module.exports.getLunchFromTable = async () => {
  return tableRowToObject(await getParsedTable(), 0);
};

module.exports.getSnackFromTable = async () => {
  return tableRowToObject(await getParsedTable(), 1);
};

module.exports.getDinnerFromTable = async () => {
  return tableRowToObject(await getParsedTable(), 2);
};
