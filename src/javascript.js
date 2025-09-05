// DOM Elements & Globals
const newLink = document.querySelector("#link");

// The Odin Project - Project: Library
const filterReadSelect = document.getElementById('filter-read');
if (filterReadSelect) {
    filterReadSelect.addEventListener('change', () => {
        filterBooksByStatus(filterReadSelect.value);
    });
}

function filterBooksByStatus(status) {

// Book Filtering Logic
    // Remove all book elements
    while (booksContainer.firstChild) {
        booksContainer.removeChild(booksContainer.firstChild);
    }
    // Filter and display books
    let filtered = library;
    if (status === 'read') {
        filtered = library.filter(book => book.status === 'read');
    } else if (status === 'started') {
        filtered = library.filter(book => book.status === 'started');
    } else if (status === 'not-read') {
        filtered = library.filter(book => book.status === 'not-read');
    }
    filtered.forEach(book => createNewBookElement(book));
    updateBookCount(filtered.length);
}

let library = []; // not a constant, so it can be filtered
let editing = undefined; // Book's ID being edited - undefined if New Book
const booksContainer = document.querySelector(".booksContainer");
const newBookBtn = document.querySelector("#new-book-button");
const newBookDialog = document.querySelector(".new-book-dialog");
const newBookForm = document.querySelector(".new-book-form");
const confirmBtn = document.querySelector("#confirm");
const newTitle = document.querySelector("#title");
const newAuthor = document.querySelector("#author");
const newPages = document.querySelector("#pages");
const newRead = document.querySelector("#read");
const newCover = document.querySelector("#cover");
const bookCount = document.querySelector(".book-count");
const noImgPath = "img/no-image.svg";

newBookBtn.addEventListener("click", () => {
    editing = undefined;
    showModalDialog();
});

confirmBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (editing !== undefined) {
        editExistingBook();
    } else {
        createNewBook();
    }
    newBookDialog.close();
});

function showModalDialog(book) {

// Modal Dialog Logic
    if (book === undefined) {
        newBookForm.reset();
    } else {
        newTitle.value = book.title;
        newAuthor.value = book.author;
        newPages.value = String(book.pages);
        if (book.status === 'read') {
            newRead.value = 'yes';
        } else if (book.status === 'started') {
            newRead.value = 'started';
        } else {
            newRead.value = 'no';
        }
        newCover.value = book.cover;
        newLink.value = book.link || "";
    }
    newBookDialog.showModal();
}

function editExistingBook() {

// Edit Book Logic
    const bookObj = library.find((book) => book.id === editing);
    bookObj.title = newTitle.value;
    bookObj.author = newAuthor.value;
    bookObj.pages = Number(newPages.value);
    if (newRead.value === "yes") {
        bookObj.read = true;
        bookObj.status = 'read';
    } else if (newRead.value === "started") {
        bookObj.read = false;
        bookObj.status = 'started';
    } else {
        bookObj.read = false;
        bookObj.status = 'not-read';
    }
    bookObj.cover = newCover.value;
    bookObj.link = newLink.value;

    const bookElem = document.querySelector(`[data-id="${bookObj.id}"]`);
    bookElem.querySelector(".book-title").textContent = bookObj.title;
    bookElem.querySelector(".book-author").textContent = bookObj.author;
    bookElem.querySelector(".book-pages").textContent = `${bookObj.pages} pages`;
    bookElem.querySelector(".book-read").textContent = bookObj.read ? "Read" : "Not read";
    bookElem.querySelector(".book-cover-art img").setAttribute("src", bookObj.cover);
}

function createNewBook() {

// Create Book Logic
    let readValue;
    if (newRead.value === "yes") {
        readValue = true;
    } else if (newRead.value === "started") {
        readValue = "started";
    } else {
        readValue = false;
    }
    const newBook = addBookToLibrary(
        newTitle.value,
        newAuthor.value,
        Number(newPages.value),
        readValue,
        newCover.value,
        newLink.value
    );
    if (newBook === null) {
        alert("We couldn't add new book. Please ensure all required fields are filled out!");
        return;
    }
    createNewBookElement(newBook);
}

function Book(title, author, pages, read, id, cover, link) {

// Book Class & Methods
    if (!new.target) {
        throw Error("Book constructor must be called with the 'new' keyword.");
    }
    this.title = title;
    this.author = author;
    this.pages = pages;
    // Convert old read boolean to new status string
    if (read === true) {
        this.status = 'read';
    } else if (read === false) {
        this.status = 'not-read';
    } else if (read === 'started') {
        this.status = 'started';
    } else {
        this.status = read || 'not-read'; // fallback for future
    }
    this.id = id;
    this.cover = cover;
    this.link = link;
}

Book.prototype.toggleRead = function () {
    // Cycle through status: not-read -> started -> read -> not-read
    if (this.status === 'not-read') {
        this.status = 'started';
    } else if (this.status === 'started') {
        this.status = 'read';
    } else {
        this.status = 'not-read';
    }
    const bookElem = document.querySelector(`[data-id="${this.id}"]`);
    const readElem = bookElem.querySelector(".book-read");
    readElem.textContent =
        this.status === 'read' ? 'Read' : (this.status === 'started' ? 'Started' : 'Not Read');
};

function addBookToLibrary(title, author, pages, read, cover, link) {

// Add Book to Library
    if (
        typeof title != "string" ||
        typeof author != "string" ||
        !Number.isInteger(pages) ||
        pages <= 0 ||
        !(typeof read === "boolean" || read === "started")
    ) {
        console.error(
            "ERROR: Books must be added with: title <string>, author <string>, pages <int>, read <bool|'started'>"
        );
        return null;
    }

    const id = crypto.randomUUID();
    const book = new Book(title, author, pages, read, id, cover, link);
    library.push(book);
    return book;
}
