var currency = "$";

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

    console.log(bookData.title, "book data");
    axios
      .post("/create-item", { book: bookData })
      .then((res) => {
        console.log(res);
        if (res.data.status !== 201) {
          alert(res.data.message);
        }
        bookData = "";
        title.value = "";
        author.value = "";
        price.value = "";
        category.value = "";

        console.log(res.data, "data in browser");
        document.getElementById("cards_wrapper").insertAdjacentHTML(
          "beforeend",
          `<div id= ${res.data.data._id}  class="book_card">
          <h3 class="title"> ${res.data.data.title}</h3>
         <div class="price_author_wrapper">
          <h6 class="author">${res.data.data.author}</h6>
          <h6 class="price" >${res.data.data.price + "" + currency}  </h6>
         </div>
        <h4 class="category">${res.data.data.category}</h4>
        <div class="btn-wrapper">
        <button data-id="${
          res.data.data._id
        }" class="card_update_btn">Edit</button>
        <button data-id="${
          res.data.data._id
        }"  class="card_delete_btn">Delete</button>
        </div>
     
    </div>`
        );
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  }

  if (event.target.classList.contains("card_update_btn")) {
    const id = event.target.getAttribute("data-id");
    const field = prompt(
      "Enter Field from this list -title, price, category, author:",
      "Type a correct field!"
    );

    var conv = field.toLowerCase();

    if (
      conv === "title" ||
      conv === "price" ||
      conv === "category" ||
      conv === "author"
    ) {
      var newData;
      if (conv === "price") {
        newData = parseInt(
          window.prompt("Enter Book Price:", "Type a number!"),
          10
        );
      } else {
        newData = prompt("Enter new Book details");
      }

      axios
        .post("/edit-item", { id, field, newData })
        .then((res) => {
          if (res.data.status !== 200) {
            console.log("ere");
            alert(res.data.message);
            return;
          }

          if (conv === "price") {
            let newPrice = res.data.data.price + currency;
            let fp = document.getElementById(`${id}`);
            fp.querySelector(`.` + conv).innerHTML = newPrice;
          } else {
            let fp = document.getElementById(`${id}`);
            fp.querySelector(`.` + conv).innerHTML = newData;
          }
        })
        .catch((err) => {
          console.log(err);
          alert(err);
        });
    } else {
      alert(
        "Wrong field entered Please select  field from this list - title, price, category, author"
      );
    }
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
  generateBooks();
  // generateBProfile();
};

function generateBooks() {
  axios
    .get("/read-item")
    .then((res) => {
      if (res.data.status !== 200) {
        alert(res.data.message);
        return;
      }
      const apple = res.data.data;

      document.getElementById("cards_wrapper").insertAdjacentHTML(
        "beforeend",
        apple
          .map((item) => {
            return `<div id= ${item._id}  class="book_card">
            <h3 class="title"> ${item.title}</h3>
           <div class="price_author_wrapper">
            <h6 class="author">${item.author}</h6>
            <h6 class="price" >${item.price + "" + currency}</h6>
        </div>
        <h4 class="category">${item.category}</h4>
        <div class="btn-wrapper">
          <button data-id="${item._id}" class="card_update_btn">Edit</button>
          <button data-id="${item._id}" class="card_delete_btn">Delete</button>
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
