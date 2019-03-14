const cheerio = require("cheerio");
const cheerioTableparser = require("cheerio-tableparser");
const foodDataFetcher = require("./foodDataFetcher");

function removeT(str) {
  return str.replace(/\t/g, "");
}

function removeNT(str) {
  return str.replace(/\t/g, "").replace(/\n/g, "");
}

function replaceBackslashToWonsign(str) {
  str = str.replace(/\\/g, "₩");
  return str;
}

function parseTable(body, date) {
  const $ = cheerio.load(body);
  cheerioTableparser($);

  let parsedTable = [];
  $(".tbl_food_list").each(function(i) {
    if (i === date) parsedTable = $(this).parsetable(true, true, true);
  });

  parsedTable.splice(0, 2);

  return parsedTable;
}

function tableRowToObject(table, row) {
  return {
    kitchen: removeNT(table[0][row]),
    meal: removeT(table[1][row]),
    price: table[2][row]
  };
}

function rowRangeToArray(table, from, to) {
  const rowRange = [];
  for (i = from; i <= to; i++) {
    rowRange.push(tableRowToObject(table, i));
  }

  return rowRange;
}

async function getParsedTable() {
  const body = await foodDataFetcher.fetchPlazaData();
  const todayDay = new Date().getDay() - 1;
  return parseTable(body, todayDay);
}

module.exports.getBreakfastFromTable = async () => {
  //조식은 가격 표시가 메뉴와 함께 되어있다.

  const range = rowRangeToArray(await getParsedTable(), 0, 1);
  range.forEach((obj, i) => {
    range[i].meal = replaceBackslashToWonsign(range[i].meal);
  });

  return range;
};

module.exports.getLunchFromTable = async () => {
  return rowRangeToArray(await getParsedTable(), 2, 6);
};

module.exports.getSnackFromTable = async () => {
  return rowRangeToArray(await getParsedTable(), 8, 9);
};

module.exports.getDinnerFromTable = async () => {
  return rowRangeToArray(await getParsedTable(), 10, 12);
};
