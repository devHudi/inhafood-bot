const request = require("request");

const plazaURL =
  "https://m.inha.ac.kr/homepage/campus/FoodMenuList.aspx?gubun=0";
const seohoURL =
  "https://m.inha.ac.kr/homepage/campus/FoodMenuList.aspx?gubun=2";

const fetchData = async url => {
  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      resolve(body);
    });
  });
};

module.exports.fetchPlazaData = async () => {
  return await fetchData(plazaURL);
};

module.exports.fetchSeohoData = async () => {
  return await fetchData(seohoURL);
};
