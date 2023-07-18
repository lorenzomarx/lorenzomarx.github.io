
let articles;
let table;

function setup() {
  //noCanvas();
  loadTable("aljazeera_business.csv", "header", gotData);
}

function gotData(table) {

  // The size of the array of Bubble objects is determined by the total number of rows in the CSV
  articles = [];

  // You can access iterate over all the rows in a table
  for (let i = 0; i < table.getRowCount(); i++) {
    let row = table.getRow(i++);
    // You can access the fields via their column name (or index)
    let headline = row.get("headline");
    let date = row.get("date");
    let author = row.get("author");
    let article = row.get("article");

    let div1 = createElement('h1',headline).addClass('card-title');
    div1.parent('result').addClass('z-depth-1');
    let div2 = createDiv(date).addClass('btn-outline-black waves-effect text-center');
    div2.parent('result');
    let div3 = createElement('h3',author).addClass();
    div3.parent('result');

    let div4 = createDiv(article).addClass('card-text');
    div4.parent('result');



  }
}
