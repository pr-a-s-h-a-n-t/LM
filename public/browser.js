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
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });

    // return;
  }

  if (event.target.classList.contains("edit-me")) {
    const id = event.target.getAttribute("data-id");
    const newData = prompt("Enter your new todo text");

    console.log(id, newData);
    axios
      .post("/edit-item", { id, newData })
      .then((res) => {
        if (res.data.status !== 200) {
          console.log("ere");
          alert(res.data.message);
          return;
        }

        event.target.parentElement.parentElement.querySelector(
          ".item-text"
        ).innerHTML = newData;
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  }
  if (event.target.classList.contains("delete-me")) {
    const id = event.target.getAttribute("data-id");

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
    .get("/read-item")
    .then((res) => {
      if (res.data.status !== 200) {
        alert(res.data.message);
        return;
      }
      const todos = res.data.data;
      console.log(todos);
      document.getElementById("item_list").insertAdjacentHTML(
        "beforeend",
        todos
          .map((item) => {
            return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
          <span class="item-text"> ${item.todo}</span>
          <div>
          <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
          <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
      </div>
      </li>`;
          })
          .join("")
      );
    })
    .catch((err) => {
      console.log(err);
    });
}

//CRUD
