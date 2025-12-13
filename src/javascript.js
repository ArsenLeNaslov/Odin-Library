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
            newRead.value = book.status === 'read' ? 'yes' : (book.status === 'started' ? 'started' : 'no');
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
    bookObj.read = newRead.value === "yes";
    bookObj.status = newRead.value === "yes" ? 'read' : (newRead.value === "started" ? 'started' : 'not-read');
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
    readValue = newRead.value === "yes" ? true : (newRead.value === "started" ? "started" : false);
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

// Book Card Creation
function createNewBookElement(book) {

    const bookElement = document.createElement("div");
    bookElement.classList.add("book");
    bookElement.classList.add("shadow");
    bookElement.setAttribute("data-id", book.id);

    const cover = document.createElement("div");
    cover.classList.add("book-cover-art");
    cover.classList.add("shadow");
    const img = document.createElement("img");
    img.setAttribute("src", book.cover !== "" ? book.cover : noImgPath);
    img.onerror = () => {
        img.setAttribute("src", noImgPath); // use no-image.svg if faulty URL provided
    };
    img.setAttribute("alt", `${book.title} cover art`);
    cover.appendChild(img);
    bookElement.appendChild(cover);

    const heading = document.createElement("div");
    heading.classList.add("book-heading");

    const title = document.createElement("h3");
    title.classList.add("book-title");
    title.textContent = `${book.title}`;
    heading.appendChild(title);

    const author = document.createElement("p");
    author.classList.add("book-author");
    author.textContent = `by ${book.author}`;
    heading.appendChild(author);

    const info = document.createElement("div");
    info.classList.add("book-info");

    const read = document.createElement("p");
    read.classList.add("book-read");
    read.textContent =
        book.status === 'read' ? 'Read' : (book.status === 'started' ? 'Started' : 'Not Read');
    info.appendChild(read);

    const pages = document.createElement("p");
    pages.classList.add("book-pages");
    pages.textContent = `${book.pages} pages`;
    info.appendChild(pages);

    const buttons = document.createElement("div");
    buttons.classList.add("book-buttons");

    const readButton = document.createElement("button");
    readButton.classList.add("book-button");
    readButton.textContent = "Toggle Read";
    buttons.appendChild(readButton);
    readButton.addEventListener("click", () => book.toggleRead());

    const linkBook = document.createElement("button");
    linkBook.classList.add("book-button");
    linkBook.textContent = "More Info";
    buttons.appendChild(linkBook);
    linkBook.addEventListener("click", () => {window.open(book.link, "_blank");
    });
    
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("book-button");
    deleteButton.textContent = "Delete Book";
    buttons.appendChild(deleteButton);
    deleteButton.addEventListener("click", () => deleteBook(bookElement));

    bookElement.appendChild(heading);
    bookElement.appendChild(info);
    bookElement.appendChild(buttons);

    // allow users to edit book by clicking on it
    bookElement.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") return; // don't open modal if button clicked
        editing = book.id;
        showModalDialog(book);
    });

    booksContainer.appendChild(bookElement);

    updateBookCount();
}

function deleteBook(book) {

// Delete Book Logic
    const id = book.getAttribute("data-id");
    library = library.filter((book) => id !== book.id); // remove object from array
    book.remove(); // remove element from page
    updateBookCount();
}

function displayLibrary() {

// Display Library
    library.forEach((book) => {
        createNewBookElement(book);
    });
}

function updateBookCount() {

// Book Count Update
    // Accepts optional count for filtered books
    let count = arguments.length ? arguments[0] : library.length;
    if (count === 1) {
        bookCount.textContent = "1 book in your library";
    } else {
        bookCount.textContent = `${count} books in your library`;
    }
}

//Books
addBookToLibrary(
    "The Glittering Plain",
    "William Morris",
    240,
    false,
    "img/Glittering.jpg",
    "https://www.professorsbookshelf.com/books/glittering-plain"
);
addBookToLibrary(
    "The Book of Wonder & The Last Book of Wonder",
    "Lord Dunsany",
    298,
    true,
    "img/Book_of_Wonder.jpg",
    "https://www.professorsbookshelf.com/books/book-of-wonder"
);
addBookToLibrary(
    "The King of Elfland's Daughter",
    "Lord Dunsany",
    240,
    true,
    "img/King_of_Elfland.png",
    "https://en.wikipedia.org/wiki/The_King_of_Elfland%27s_Daughter"
);
addBookToLibrary(
    "Time and the Gods",
    "Lord Dunsany",
    584,
    false,
    "img/Time.jpg",
    "https://www.goodreads.com/es/book/show/757018.Time_and_the_Gods"
);
addBookToLibrary(
    "Two Bottles of Relish",
    "Lord Dunsany",
    234,
    true,
    "img/2Bottles.png",
    "https://www.ebsco.com/research-starters/literature-and-writing/two-bottles-relish-lord-dunsany"
);
addBookToLibrary(
    "Celtic Myths and Legends",
    "Peter Berresford Ellis",
    612,
    "started",
    "img/Celtic.png",
    "https://www.goodreads.com/book/show/700460.Celtic_Myths_and_Legends"
);
addBookToLibrary(
    "Of Ghosts and Goblins",
    "Lafcadio Hearn",
    224,
    true,
    "img/Ghosts_Goblins.jpg",
    "https://www.goodreads.com/book/show/60764312-of-ghosts-and-goblins"
);
addBookToLibrary(
    "The Complete Short Stories of",
    "Ambrose Bierce",
    496,
    true,
    "img/Bierce.jpg",
    "https://www.nebraskapress.unl.edu/bison-books/9780803260719/the-complete-short-stories-of-ambrose-bierce/"
);
addBookToLibrary(
    "Fahrenheit 451",
    "Ray Bradbury",
    256,
    true,
    "img/Fahrenheit451.jpg",
    "https://en.wikipedia.org/wiki/Fahrenheit_451"
);
addBookToLibrary(
    "The Island of Doctor Moreau",
    "H.G. Wells",
    193,
    true,
    "img/Moreau.png",
    "https://en.wikipedia.org/wiki/The_Island_of_Doctor_Moreau"
);
addBookToLibrary(
    "The New Annotated H.P. Lovecraft",
    "H.P. Lovecraft & Leslie S. Klinger",
    928,
    true,
    "img/Lovecraft.jpg",
    "https://lesliesklinger.com/books/the-new-annotated-h-p-lovecraft/"
);
addBookToLibrary(
    "The New Annotated H.P. Lovecraft: Beyond Arkham",
    "H.P. Lovecraft & Leslie S. Klinger",
    512,
    true,
    "img/Lovecraft2.jpg",
    "https://lesliesklinger.com/books/the-new-annotated-h-p-lovecraft-beyond-arkham/"
);
addBookToLibrary(
    "Dracula",
    "Bram Stoker",
    432,
    true,
    "img/Dracula.png",
    "https://www.spiegelburg-shop.de/grosse-schmuckausgabe-bram-stoker-dracula/64224"
);
addBookToLibrary(
    "From Here to Eternity",
    "Caitlin Doughty",
    248,
    true,
    "img/FromHere.png",
    "https://caitlindoughty.com/books/from-here-to-eternity/"
);
addBookToLibrary(
    "Blindness - Ensaio sobre a Cegueira",
    "José Saramago",
    320,
    true,
    "img/Saramago.jpg",
    "https://www.josesaramago.org/en/book/blindness-essay/"
);
addBookToLibrary(
    "Ringworld",
    "Larry Niven",
    342,
    true,
    "img/Ringworld.png",
    "https://www.worldswithoutend.com/novel.asp?ID=18"
);
addBookToLibrary(
    "The Unaccountability Machine",
    "Dan Davies",
    304,
    "started",
    "img/Machine.jpg",
    "https://press.uchicago.edu/ucp/books/book/chicago/U/bo252799883.html"
);
addBookToLibrary(
    "How Migration really works",
    "Hein de Haas",
    430,
    true,
    "img/How_Migration.png",
    "https://www.migrationinstitute.org/publications/how-migration-really-works"
);
addBookToLibrary(
    "The Silk Roads",
    "Peter Frankopan",
    736,
    false,
    "img/Silk.jpg",
    "https://www.peterfrankopan.com/the-silk-roads.html"
);
addBookToLibrary(
    "The Earth Transformed",
    "Peter Frankopan",
    698,
    "started",
    "img/Earth.jpg",
    "https://www.peterfrankopan.com/the-earth-transformed.html"
);
addBookToLibrary(
    "Slovenology",
    "Noah Charney",
    270,
    true,
    "img/Slovenology.jpg",
    "https://beletrina.si/knjiga/slovenology-angleski-jezik"
);
addBookToLibrary(
    "Slovenoljub",
    "Noah Charney",
    256,
    false,
    "img/Slovenoljub.jpg",
    "https://www.rtvslo.si/kultura/knjige/slovenoljub-noah-charney-je-preprican-da-so-slovenci-najprisrcnejsi-ljudje-na-svetu/756351"
);
addBookToLibrary(
    "Bledology",
    "Noah Charney",
    240,
    true,
    "img/Bledology.jpg",
    "https://www.noahcharney.com/Books/Bledology"
);
addBookToLibrary(
    "Trieste and the Meaning of Nowhere",
    "Jan Morris",
    188,
    true,
    "img/Trieste.jpg",
    "https://www.goodreads.com/book/show/61043.Trieste_and_The_Meaning_of_Nowhere"
);
addBookToLibrary(
    "Serbi Croati Sloveni",
    "Jože Pirjevec",
    236,
    true,
    "img/SHS.jpeg",
    "https://www.mulino.it/isbn/9788815259363"
);
addBookToLibrary(
    "Storia degli sloveni in Italia 1866-1998",
    "Milica Kacin Wohinz & Jože Pirjevec",
    150,
    true,
    "img/Zgodovina.jpg",
    "https://www.glisfogliati.com/negozio/wohinz-pirjevec-storia-degli-sloveni-in-italia-1866-1998-1998/"
);
addBookToLibrary(
    "The Narodni Dom: Trieste, 1904-1920",
    "Martina Kafol & Ace Mermolja",
    79,
    true,
    "img/Narodni_Dom.jpg",
    "https://www.ts360srl.com/it/spletna-knjigarna/il-narodni-dom-di-trieste-1904-1920/"
);
addBookToLibrary(
    "La Fiamma Nera",
    "Ivan Smiljanić & Zoran Smiljanić",
    79,
    false,
    "img/Plamen.jpg",
    "https://www.ibs.it/fiamma-nera-rogo-del-narodni-libro-ivan-smiljanic-zoran-smiljanic/e/9788899007898#cc-anchor-dettagli"
);
addBookToLibrary(
    "A cavallo del muro",
    "Demetrio Volcic",
    192,
    true,
    "img/Volcic.jpg",
    "https://www.sellerio.it/it/catalogo/Cavallo-Muro-Miei-Giorni-Europa-Est/-/15158"
);
addBookToLibrary(
    "Vita del Confinato Luigi Spacal",
    "Nicola Coccia",
    204,
    true,
    "img/Spacal.jpg",
    "https://www.edizioniets.com/scheda.asp?n=9788846768742"
);
addBookToLibrary(
    "Quello che ho da dirvi",
    "Boris Pahor",
    110,
    true,
    "img/Pahor.jpg",
    "https://www.ts360srl.com/it/spletna-knjigarna/quello-che-ho-da-dirvi/"
);
addBookToLibrary(
    "Necropoli",
    "Boris Pahor",
    160,
    true,
    "img/Necropoli.jpg",
    "https://www.ibs.it/necropoli-graphic-novel-libro-boris-pahor/e/9788893132558#cc-anchor-dettagli"
);
addBookToLibrary(
    "Boris Pahor: Scrittore Senza Frontiere",
    "Walter Chiereghin & Fulvio Senardi",
    352,
    "started",
    "img/Pahor2.jpg",
    "https://www.ts360srl.com/it/spletna-knjigarna/boris-pahor-scrittore-senza-frontiere/"
);
addBookToLibrary(
    "La Danza delle Ombre Senčni Ples",
    "Alojz Rebula",
    352,
    true,
    "img/Ples.jpg",
    "https://www.ts360srl.com/it/spletna-knjigarna/la-danza-delle-ombre/"
);
addBookToLibrary(
    "Aspri Ritmi - Ostri Ritmi",
    "Srečko Kosovel",
    272,
    "started",
    "img/Ostri.jpg",
    "https://www.ztt-est.it/sl/knjige/aspri-ritmi-ostri-ritmi"
);
addBookToLibrary(
    "Il servo jernej e il suo Diritto - Hlapec Jernej in njegova Pravica",
    "Ivan Cankar",
    190,
    false,
    "img/Cankar.jpg",
    "https://www.ts360srl.com/spletna-knjigarna/hlapec-jernej-in-njegova-pravica/"
);
addBookToLibrary(
    "Questa Trieste",
    "Marija Pirjevec",
    270,
    true,
    "img/Trst.jpg",
    "https://www.ts360srl.com/it/spletna-knjigarna/questa-trieste/"
);
addBookToLibrary(
    "Racconti Umoristici Triestini",
    "Vladimir Bartol",
    224,
    "started",
    "img/Humoreske.jpg",
    "https://www.ibs.it/racconti-umoristici-triestini-libro-vladimir-bartol/e/9788862870986"
);
addBookToLibrary(
    "Zora: Una storia di resistenza",
    "Lida Turk",
    245,
    true,
    "img/Zora.jpg",
    "https://www.ztt-est.it/sl/knjige/zora"
);
addBookToLibrary(
    "Un Onomasticidio di Stato",
    "Miro Tasso",
    192,
    true,
    "img/Tasso.jpg",
    "https://www.ts360srl.com/it/spletna-knjigarna/un-onomasticidio-di-stato/"
);
addBookToLibrary(
    "Il Giorno in cui finì l'Estate - V Elvisovi Sobi",
    "Sebastian Pregelj",
    308,
    true,
    "img/Elvisovi.jpg",
    "https://www.bottegaerranteedizioni.it/product/il-giorno-in-cui-fini-lestate/"
);
addBookToLibrary(
    "Stanotte l'ho Vista - To noč sem jo Videl",
    "Drago Jančar",
    212,
    true,
    "img/Videl.jpg",
    "https://www.ts360srl.com/it/spletna-knjigarna/stanotte-lho-vista/"
);
addBookToLibrary(
    "All'Ombra del Fico - Figa",
    "Goran Vojnović",
    463,
    true,
    "img/Figa.jpg",
    "https://www.ts360srl.com/spletna-knjigarna/figa/"
);
addBookToLibrary(
    "Čefurji Raus!",
    "Goran Vojnović",
    198,
    true,
    "img/Čefurji.jpg",
    "https://www.ts360srl.com/it/spletna-knjigarna/cefuri-raus/"
);
addBookToLibrary(
    "Spomenik",
    "Gianni Galleri",
    200,
    "started",
    "img/Spomenik.jpg",
    "https://www.bottegaerranteedizioni.it/spomenik/"
);
addBookToLibrary(
    "Itinerari a piedi nelle Valli del Natisone - Pešpoti po Nediških dolinah",
    "Brunello Pagavino",
    215,
    false,
    "img/Dolina.png",
    "https://www.noviglas.eu/vabilo-k-odkrivanju-lepot-benecije-s-pohodi-po-nediskih-terskih-dolinah/"
);
addBookToLibrary(
    "La Farina dei Partigiani",
    "Piero Purich & Andrej Marini",
    464,
    false,
    "img/Farina.jpg",
    "https://edizionialegre.it/product/la-farina-dei-partigiani/"
);
addBookToLibrary(
    "Il Figlio della Lupa",
    "Francesco Tomada & Anton Špacapan Vončina",
    333,
    false,
    "img/Volkulja.png",
    "https://thebookishexplorer.com/2025/03/04/anton-spacapan-voncina-e-francesco-tomada-il-figlio-della-lupa/"
);
addBookToLibrary(
    "Monalogo de Molly",
    "James Joyce & Fulvio Rogantin",
    72,
    true,
    "img/Monalogo.png",
    "https://www.passioneirlanda.com/monalogo-de-molly/"
);
addBookToLibrary(
    "L'Osmiza sul Mare",
    "Diego Manna",
    192,
    true,
    "img/Osmiza.jpg",
    "https://bora.la/prodotto/l-osmiza-sul-mare/"
);
addBookToLibrary(
    "La smonta la prossima? Una vita in corriera",
    "Davide Destradi",
    148,
    true,
    "img/Smonta.jpg",
    "https://bora.la/prodotto/la-smonta-la-prossima-una-vita-in-corriera/"
);
addBookToLibrary(
    "RIP: Ridi in Pace",
    "Davide Destradi",
    176,
    "started",
    "img/Ridi.png",
    "https://bora.la/prodotto/rip-ridi-in-pace/"
);
addBookToLibrary(
    "Casa mia, Casa mia",
    "Chiara Gily & Francesca Sarocchi",
    118,
    true,
    "img/Hiša.jpg",
    "https://bora.la/prodotto/casa-mia-casa-mia-come-tirar-vanti-nela-giungla-del-cemento-triestin/"
);
addBookToLibrary(
    "Trieste 1719: Quando gli Asburgo Scoprirono il Mare",
    "Edda Vidiz",
    218,
    true,
    "img/Trst1719.jpg",
    "https://bora.la/prodotto/trieste-1719-quando-gli-asburgo-scoprirono-il-mare/"
);
addBookToLibrary(
    "Tergeste: dove regna la Bora",
    "Edda Vidiz",
    92,
    true,
    "img/Bora.jpg",
    "https://bora.la/prodotto/tergeste-dove-regna-la-bora/"
);
addBookToLibrary(
    "C'era una volta a… Triestewood",
    "Andrea Martinis",
    176,
    true,
    "img/Triestewood.jpg",
    "https://bora.la/prodotto/cera-una-volta-a-triestewood/"
);
addBookToLibrary(
    "Troppo triestini",
    "Paolo Pascutto",
    96,
    true,
    "img/Tropo.jpg",
    "https://bora.la/prodotto/troppo-triestini/"
);
displayLibrary();