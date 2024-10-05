let menu_data = [
    { id: "dashboard", icon: "mdi mdi-cart-outline", width: 20, value: "Dashboards", link: "/" },
    { id: "riwayat", icon: "mdi mdi-history", value: "Riwayat", link: "/riwayat" },
    { id: "barang", icon: "mdi mdi-semantic-web", value: "Data Barang", link: "/barang" }
];

let format = webix.Date.dateToStr("%d/%M/%Y");
let strDate = format(new Date());

function responsiveSidebar() {
    let width = document.body.offsetWidth;
    if (width <= 1000) {
        $$("sidebar_menu").collapse();
    } else {
        $$("sidebar_menu").expand();
    }
}

webix.event(window, "resize", function () {
    responsiveSidebar();
});

function clickToggleMenu() {
    $$("sidebar_menu").toggle();
}

function switchMenu(id) {
    let selectedMenu = this.getItem(id);
    if (selectedMenu.id != "barang") {
        window.location.href = selectedMenu.link;
    }
}

function showDateTime() {
    webix.i18n.parseTimeFormat = "%H:%i";
    webix.i18n.setLocale();

    setInterval(function () {
        $$("current_time").refresh()
    }, 1000);

    return strDate + "<span>&emsp;</span>" + webix.i18n.parseTimeFormatStr(new Date());
}

function formatCurrency(value) {
    return webix.Number.format(value, {
        groupSize: 3,
        groupDelimiter: ".",
        decimalSize: 0,
        decimalDelimiter: ","
    });
}

function currencyHargaBeli(obj) {
    return formatCurrency(obj.harga_beli)
}

function currencyHargaJual(obj) {
    return formatCurrency(obj.harga_jual)
}

function currencyStokBarang(obj) {
    return formatCurrency(obj.stok)
}

function changeFormatCurrency(id_form) {
    let value = $$(id_form).getValue();
    value = value.replace(/\D/g, '');
    value = formatCurrency(value);
    $$(id_form).setValue(value);
}

function changeFormatToUpperCase(value, id_form) {
    let data = value.toUpperCase();
    $$(id_form).setValue(data);
}

let modeAksiForm = "tambah"

let windowTambahData = webix.ui({
    id: "windowData",
    view: "window",

    height: 380,
    width: 400,
    padding: -50,
    head: "Tambah data",
    position: "center",
    close: true,
    move: true,
    on: { onHide: function () { $$("form_data").clearValidation(); } },
    body: {
        id: "form_data",
        view: "form",
        padding: 30,
        margin: 40,
        elements: [
            {
                id: "layout_form",
                view: "layout",
                cols: [
                    {
                        margin: 10,
                        rows: [
                            {
                                id: "kode_barang",
                                view: "text",
                                label: "Kode barang",
                                name: "kode_barang",
                                on: {
                                    onEnter: function () { changeFormatToUpperCase(this.getValue(), "kode_barang") },
                                    onBlur: function () { changeFormatToUpperCase(this.getValue(), "kode_barang") },
                                }
                            },
                            { id: "nama", view: "text", label: "Nama barang", name: "nama" },
                            { id: "stok", view: "counter", label: "Stok", name: "stok", min: 1 }
                        ]
                    },
                    { width: 30 },
                    {
                        margin: 10,
                        rows: [
                            {
                                id: "harga_beli",
                                view: "text",
                                label: "Harga beli",
                                name: "harga_beli",
                                on: {
                                    onEnter: function () { changeFormatCurrency("harga_beli") },
                                    onBlur: function () { changeFormatCurrency("harga_beli") }
                                }
                            },
                            {
                                id: "harga_jual",
                                view: "text",
                                label: "Harga jual",
                                name: "harga_jual",
                                on: {
                                    onEnter: function () { changeFormatCurrency("harga_jual") },
                                    onBlur: function () { changeFormatCurrency("harga_jual") }
                                }
                            }
                        ]
                    },
                ]
            },
            {
                id: "btn_form",
                view: "button",
                value: "tambah",
                mode: "tambah",
                css: "webix_primary",
                click: function () { btnFormManipulation(this.config.mode) }
            }
        ],
        rules: {
            "kode_barang": webix.rules.isNotEmpty,
            "nama": webix.rules.isNotEmpty,
            "stok": webix.rules.isNotEmpty,
            "harga_beli": webix.rules.isNotEmpty,
            "harga_jual": webix.rules.isNotEmpty
        },
        elementsConfig: {
            labelPosition: "top"
        }
    }
})

function btnFormManipulation(mode) {
    if ($$("form_data").validate()) {
        data = $$("form_data").getValues()
        // data["kode_barang"] = data["kode_barang"].toUpperCase();
        data["harga_beli"] = data["harga_beli"].replace(/\./g, '');
        data["harga_jual"] = data["harga_jual"].replace(/\./g, '');

        if (parseInt(data["harga_beli"]) >= parseInt(data["harga_jual"])) {
            webix.message({ type: "error", text: "Harga beli tidak boleh lebih besar atau sama dengan harga jual" });
            return false
        }

        if (mode === "tambah") {
            webix.ajax().post('/barang/tambah-barang', data, function (text) {
                windowTambahData.hide()
                let result = JSON.parse(text);
                let message = result.message;

                if (result.status === 'success') {
                    webix.message({ type: "success", text: message });
                    window.location.href = '/barang';
                } else {
                    webix.alert({
                        type: "alert-error",
                        title: "Tambah Data Barang",
                        text: message
                    })
                }
            })
        } else if (mode === "ubah") {
            webix.ajax().put('/barang/ubah-barang', data, function (text) {
                windowTambahData.hide()
                let result = JSON.parse(text);
                let message = result.message;

                if (result.status === 'success') {
                    webix.message({ type: "success", text: message });
                    window.location.href = '/barang';
                } else {
                    webix.alert({
                        type: "alert-error",
                        title: "Ubah Data Barang",
                        text: message
                    })
                }
            })
        }
    } else {
        webix.message({ type: "error", text: "Data tidak boleh kosong!" });
    }
}

function addDataBtn() {
    $$("table_items").unselectAll();
    $$("form_data").clear();
    $$("windowData").getHead().getChildViews()[0].setHTML("Tambah Data")
    $$("btn_form").define("label", "Tambah");
    $$("btn_form").define("mode", "tambah");
    $$("kode_barang").define("readonly", false);
    $$("kode_barang").refresh();
    $$("btn_form").refresh();
    windowTambahData.show();
}

function editDataBtn() {
    let selectedItem = $$("table_items").getSelectedItem();
    if (selectedItem) {
        $$("form_data").setValues(selectedItem);
        $$("windowData").getHead().getChildViews()[0].setHTML("Edit Data");
        $$("btn_form").define("label", "Ubah");
        $$("btn_form").define("mode", "ubah");
        $$("kode_barang").define("readonly", true);
        $$("kode_barang").refresh();
        $$("btn_form").refresh();
        windowTambahData.show();
    } else {
        webix.message({ type: "info", text: "Pilih baris data untuk diedit!" });
    }
}

function deleteDataBtn() {
    let selectedId = $$('table_items').getSelectedId();
    if (selectedId) {
        webix.confirm({
            title: "Konfirmasi Hapus Data",
            type: "confirm-warning",
            ok: "Hapus",
            cancel: "Batal",
            text: "Apakah anda yakin untuk menghapus data ini?"
        }).then(function (result) {
            let dataBarang = $$("table_items").getItem(selectedId);
            let dictKodeBarang = {
                "kode_barang": dataBarang.kode_barang
            }

            webix.ajax().del('/barang/hapus-barang', dictKodeBarang, function (text) {
                let result = JSON.parse(text);
                let message = result.message;

                if (result.status === 'success') {
                    webix.message({ type: "success", text: message });
                    window.location.href = '/barang';
                } else {
                    webix.alert({
                        type: "alert-error",
                        title: "Hapus Data Barang",
                        text: message
                    })
                }
            })
        })
    } else {
        webix.message({ type: "info", text: "Pilih baris untuk dihapus" });
    }
}

function filterStok(stok) {
    let inputStok = stok;
    let inputText = $$("filter_table").getValue().toString().toLowerCase();
    let tabelBarang = $$("table_items");

    tabelBarang.filter(function (obj) {
        if (inputStok !== "") {
            if (inputText !== "") {
                let filter = [obj.nama, obj.kode_barang].join("|");
                return filter.toString().toLowerCase().indexOf(inputText) != -1 && obj.stok < inputStok;
            } else {
                return obj.stok < inputStok
            }
        } else if (inputStok == "" && inputText != "") {
            let filter = [obj.nama, obj.kode_barang].join("|");
            return filter.toString().toLowerCase().indexOf(inputText) != -1;
        } else {
            return true;
        }
    });

    webix.extend(tabelBarang, webix.OverlayBox);
    tabelBarang.hideOverlay();

    if (tabelBarang.count() === 0) {
        tabelBarang.showOverlay("Tidak ada data");
    }
}

function filterData(data) {
    let text = data.toString().toLowerCase();
    let inputStok = $$("filter_stok").getValue();
    let tabelBarang = $$("table_items");

    tabelBarang.filter(function (obj) {
        if (text !== "") {
            let filter = [obj.nama, obj.kode_barang].join("|");
            if (inputStok != "") {
                return filter.toString().toLowerCase().indexOf(text) != -1 && obj.stok < inputStok;
            } else {
                return filter.toString().toLowerCase().indexOf(text) != -1;
            }
        } else if (text == "" && inputStok != "") {
            return obj.stok < inputStok
        } else {
            return true;
        }
    });

    webix.extend(tabelBarang, webix.OverlayBox)
    tabelBarang.hideOverlay();

    if (tabelBarang.count() === 0) {
        tabelBarang.showOverlay("Tidak ada data");
    }
}



webix.ready(function () {
    // webix.ui.fullScreen();
    webix.ui({
        rows: [
            // =====> Header <=====
            {
                id: "header",
                view: "toolbar",
                padding: 10,
                css: "bg_blue",
                elements: [
                    { id: "iconMenu", view: "icon", icon: "mdi mdi-menu", width: 40, css: "icon_hamburger", click: clickToggleMenu },
                    { id: "appName", view: "label", label: "KasirKu", css: "header_title" }
                ]
            },
            // =====> Body <=====
            {
                cols: [
                    // =====> Sidebar Menu <=====
                    {
                        id: "sidebar_menu",
                        view: "sidebar",
                        border: true,
                        width: 200,
                        titleHeight: 63,
                        collapsedWidth: 62,
                        css: "sidebar_custom ",
                        data: menu_data,
                        on: {
                            onAfterSelect: switchMenu, onMouseMove: function (id) {
                                this.getPopup().hide()
                            }
                        }
                    },
                    {
                        borderless: true,
                        type: "space",
                        rows: [
                            // =====> Menu Name & Datetime <===== (belum responsive di width screen 650)
                            {
                                minHeight: 60,
                                css: "bg_gray",
                                cols: [
                                    { id: "label_menu", view: "label", label: "MENU DATA BARANG", css: "custom_header_menu" },
                                    { id: "current_time", template: showDateTime, type: "clean", css: "text_right custom_header_time" }
                                ]
                            },
                            // ubah dari sini
                            {
                                rows: [
                                    {
                                        id: "toolbar_filter",
                                        view: "toolbar",
                                        maxHeight: 50,
                                        paddingX: 10,
                                        paddingY: 15,
                                        margin: 15,
                                        rows: [
                                            {
                                                responsive: "toolbar_filter",
                                                cols: [
                                                    {
                                                        minWidth: 300,
                                                        cols: [
                                                            {
                                                                id: "filter_table",
                                                                view: "text",
                                                                label: "Cari Data",
                                                                placeholder: "Kode dan nama barang",
                                                                labelPosition: "top",
                                                                minWidth: 180,
                                                                on: {
                                                                    // onTimedKeyPress: function(){filterData(this.getValue())}
                                                                    onEnter: function () { filterData(this.getValue()) }
                                                                }
                                                            },
                                                            {
                                                                id: "filter_stok",
                                                                view: "text",
                                                                type: "number",
                                                                label: "Filter Stok",
                                                                placeholder: "Stok kurang dari",
                                                                labelPosition: "top",
                                                                minWidth: 145,
                                                                on: {
                                                                    onEnter: function () { filterStok(this.getValue()) }
                                                                    // onTimedKeyPress: function(){filterStok(this.getValue())}
                                                                },
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        minWidth: 300,
                                                        maxHeight: 90,
                                                        margin: 10,
                                                        cols: [
                                                            {},
                                                            {
                                                                rows: [
                                                                    {},
                                                                    {
                                                                        id: "add_btn",
                                                                        view: "button",
                                                                        type: "icon",
                                                                        icon: "mdi mdi-plus",
                                                                        label: "Tambah",
                                                                        width: 100,
                                                                        height: 50,
                                                                        align: "center",
                                                                        css: "webix_primary",
                                                                        click: addDataBtn
                                                                    },
                                                                ]
                                                            },
                                                            {
                                                                rows: [
                                                                    {},
                                                                    {
                                                                        id: "edit_btn",
                                                                        view: "button",
                                                                        type: "icon",
                                                                        icon: "mdi mdi-pencil",
                                                                        label: "Ubah",
                                                                        value: "edit",
                                                                        width: 100,
                                                                        height: 50,
                                                                        align: "center",
                                                                        css: "webix_secondary",
                                                                        click: editDataBtn,
                                                                    },
                                                                ]
                                                            },
                                                            {
                                                                rows: [
                                                                    {},
                                                                    {
                                                                        id: "delete_btn",
                                                                        view: "button",
                                                                        type: "icon",
                                                                        icon: "mdi mdi-delete",
                                                                        label: "Hapus",
                                                                        width: 100,
                                                                        height: 50,
                                                                        align: "center",
                                                                        css: "webix_danger",
                                                                        click: deleteDataBtn,
                                                                    },
                                                                ]
                                                            },
                                                        ]
                                                    }
                                                ]
                                            },
                                        ]
                                    },
                                    {
                                        id: "table_items",
                                        view: "datatable",
                                        css: "webix_header_border webix_data_border",
                                        columns: [
                                            { id: "no", header: "No", sort: "int", autoIncrement: true, width: 60 },
                                            { id: "kode_barang", header: "Kode Barang", sort: "text", fillspace: 3 },
                                            { id: "nama", header: "Nama Barang", sort: "text", fillspace: 4 },
                                            { id: "harga_beli", header: "Harga Beli", sort: "int", fillspace: 2, css: "text_right", template: currencyHargaBeli },
                                            { id: "harga_jual", header: "Harga Jual", sort: "int", fillspace: 2, css: "text_right", template: currencyHargaJual },
                                            { id: "stok", header: "Stok", sort: "int", fillspace: 2, css: "text_right", template: currencyStokBarang }
                                        ],
                                        scheme: {
                                            $init: function (obj) {
                                                obj.no = this.count();
                                            }
                                        },
                                        url: "/get-barang",
                                        autoWidth: true,
                                        maxHeight: 1000,
                                        select: true,
                                        scroll: "y",
                                        onClick: {
                                            "wxi-trash": function (event, id, node) {
                                                this.remove(id)
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    })

    $$("sidebar_menu").select("barang");
    responsiveSidebar();
    webix.message.expire = 1800;
})