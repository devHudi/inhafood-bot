"use strict";

const plazaParser = require("./plazaParser");
const seohoParser = require("./seohoParser");

function getReplyMessage(message, buttonType) {
  let buttons = [];
  switch (buttonType) {
    case "main":
      buttons = ["학생회관 (비룡플라자)", "서호관", "문의하기", "개발자 정보"];
      break;
    case "plaza":
      buttons = [
        "아침 (학생회관)",
        "점심 (학생회관)",
        "스낵 (학생회관)",
        "저녁 (학생회관)",
        "처음으로"
      ];
      break;
    case "seoho":
      buttons = ["점심 (서호관)", "스낵 (서호관)", "저녁 (서호관)", "처음으로"];
      break;
  }

  const replyMessage = {
    message: {
      text: message
    },
    keyboard: {
      type: "buttons",
      buttons: buttons
    }
  };

  return replyMessage;
}

function getTodayDateText() {
  let today = new Date();

  if (today.getDay() === 0 || today.getDay() === 6) {
    const first = today.getDate() - today.getDay();
    today = new Date(today.setDate(first + 6)).toUTCString();
  }

  return `${today.getFullYear()}년 ${today.getMonth() +
    1}월 ${today.getDate()}일 학식`;
}

function mealObjectToText(mealObj) {
  let text = `${getTodayDateText()}\n\n`;

  mealObj.forEach((obj, i) => {
    text += `[${obj.kitchen}]\n`;
    text += `${obj.meal}\n\n`;
    if (obj.price !== "") text += `${obj.price} 원\n\n`;
  });
  return text;
}

function getSendData(message, buttonType, statusCode = 200) {
  return {
    statusCode,
    body: JSON.stringify(getReplyMessage(message, buttonType))
  };
}

module.exports.message = async (event, context) => {
  const { content } = JSON.parse(event.body);

  let message = "";
  let buttonType = "";

  switch (content) {
    //메인메뉴
    case "처음으로":
      message = "학생회관 (비룡플라자) / 서호관 을 선택해주세요.";
      buttonType = "main";
      break;

    case "문의하기":
      message =
        "아래 링크로 접속하여, 인하대학교 학식 알리미 문의 오픈채팅에 접속해주세요.\n\nhttps://open.kakao.com/o/svLzGu6";
      buttonType = "main";
      break;

    case "개발자 정보":
      message =
        "인하대학교 17학번 사회인프라공학과 조동현 (Hudi)\n\n블로그) http://hudi.kr\n페이스북) http://www.facebook.com/profile.php?id=100007156273191";
      buttonType = "main";
      break;

    case "학생회관 (비룡플라자)":
      message = "아침/점심/스낵/저녁 중에서 선택해주세요.";
      buttonType = "plaza";
      break;

    case "서호관":
      message = "점심/스낵/저녁 중에서 선택해주세요.";
      buttonType = "seoho";
      break;

    //학생회관 메뉴
    case "아침 (학생회관)":
      message = mealObjectToText(await plazaParser.getBreakfastFromTable());
      buttonType = "plaza";
      break;

    case "점심 (학생회관)":
      message = mealObjectToText(await plazaParser.getLunchFromTable());
      buttonType = "plaza";
      break;

    case "스낵 (학생회관)":
      message = mealObjectToText(await plazaParser.getSnackFromTable());
      buttonType = "plaza";
      break;

    case "저녁 (학생회관)":
      message = mealObjectToText(await plazaParser.getDinnerFromTable());
      buttonType = "plaza";
      break;

    //서호관 메뉴
    case "점심 (서호관)":
      message = mealObjectToText(await seohoParser.getLunchFromTable());
      buttonType = "seoho";
      break;

    case "스낵 (서호관)":
      message = mealObjectToText(await seohoParser.getSnackFromTable());
      buttonType = "seoho";
      break;

    case "저녁 (서호관)":
      message = mealObjectToText(await seohoParser.getDinnerFromTable());
      buttonType = "seoho";
      break;
  }

  return getSendData(message, buttonType);
};

module.exports.keyboard = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      type: "buttons",
      buttons: ["학생회관 (비룡플라자)", "서호관"]
    })
  };
};
