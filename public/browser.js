let skip = 0;

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("add_item")) {
    event.preventDefault();
    console.log("add item");
    const title = document.getElementById("title");
    const author = document.getElementById("author");
    const price = document.getElementById("price");
    const category = document.getElementById("category");
    // console.log(title, author, price, category, "sssss");

    if (title.value === "") {
      alert("Please enter title");
      return;
    }
    if (author.value === "") {
      alert("Please enter author");
      return;
    }
    if (price.value === "") {
      alert("Please enter author");
      return;
    }
    if (category.value === "") {
      alert("Please enter price");
      return;
    }
    let bookData = {
      title: title.value,
      author: author.value,
      price: price.value,
      category: category.value,
    };

    console.log(bookData, "book data");
    axios
      .post("/create-item", { book: bookData })
      .then((res) => {
        console.log(res);
        if (res.data.status !== 201) {
          alert(res.data.message);
        }
        bookData = "";
        // generateTodos();

        console.log(res.data, "data in browser");
        document.getElementById("cards_wrapper").insertAdjacentHTML(
          "beforeend",
          `<div id= ${res.data.data._id}  class="book_card">
          <h3 class="title"> ${res.data.data.title}</h3>
         <div class="price_author_wrapper">
          <h6 class="author">${res.data.data.author}</h6>
          <h6 class="price" >${res.data.data.price}</h6>
      </div>
      <h4 class="category">${res.data.data.category}</h4>
      <div class="btn-wrapper">
        <button data-id="${res.data.data._id}" class="card_update_btn">Edit</button>
        <button data-id="${res.data.data._id}"  class="card_delete_btn">Delete</button>
        </div>
     
    </div>`
        );
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });

    // return;
  }

  if (event.target.classList.contains("card_update_btn")) {
    const id = event.target.getAttribute("data-id");
    const field = prompt("choose your field");
    const newData = prompt("Enter your new todo text");

    console.log(id, newData, "edit btn has been hit");
    axios
      .post("/edit-item", { id, field, newData })
      .then((res) => {
        if (res.data.status !== 200) {
          console.log("ere");
          alert(res.data.message);
          return;
        }

        let fp = document.getElementById(`${id}`);
        fp.querySelector(`.` + field).innerHTML = newData;
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  }
  if (event.target.classList.contains("card_delete_btn")) {
    const id = event.target.getAttribute("data-id");

    console.log(id, "delete btn has been hit");

    axios
      .post("/delete-item", { id })
      .then((res) => {
        if (res.data.status !== 200) {
          alert(res.data.message);
          return;
        }

        event.target.parentElement.parentElement.remove();
        return;
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  }

  if (event.target.classList.contains("show_more")) {
    generateTodos();
  }
});

window.onload = function () {
  generateTodos();
};

function generateTodos() {
  //read the todos
  axios
    .get("http://localhost:8080/read-item")
    .then((res) => {
      if (res.data.status !== 200) {
        alert(res.data.message);
        return;
      }
      const apple = res.data.data;
      console.log(apple, "ssssssssssssss");
      document.getElementById("cards_wrapper").insertAdjacentHTML(
        "beforeend",
        apple
          .map((item) => {
            return `<div id= ${item._id}  class="book_card">
            <h3 class="title"> ${item.title}</h3>
           <div class="price_author_wrapper">
            <h6 class="author">${item.author}</h6>
            <h6 class="price" >${item.price}</h6>
        </div>
        <h4 class="category">${item.category}</h4>
        <div class="btn-wrapper">
          <button data-id="${item._id}" class="card_update_btn">Edit</button>
          <button data-id="${item._id}"  class="card_delete_btn">Delete</button>
          </div>
       
      </div>`;
          })
          .join("")
      );
    })
    .catch((err) => {
      console.log(err);
    });
}
