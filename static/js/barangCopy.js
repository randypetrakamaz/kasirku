let menu_data = [
	{id: "dashboard", icon: "mdi mdi-cart-outline", width: 20, value: "Dashboards", link: "/"},
	{id: "riwayat", icon: "mdi mdi-history", value: "Riwayat", link: "/riwayat"},
	{id: "barang", icon: "mdi mdi-semantic-web", value: "Data Barang", link: "/barang"}
];

let format = webix.Date.dateToStr("%d/%M/%Y");
let strDate = format(new Date());

function formatCurrency(value) {
    return webix.Number.format(value, {
        groupSize: 3,
        groupDelimiter: ".",
        decimalSize: 0,
        decimalDelimiter: ","
    });
}

let modeAksiForm = "tambah"

let windowTambahData = webix.ui({
    id: "windowData",
    view: "window",
    height: 380,
    width: 400,
    head: "Tambah data",
    position: "center",
    close: true,
    move: true,
    position: "top",
    padding: -50,
    body:{
        id: "formData",
        view: "form",
        padding: 30,
        margin: 40,
        elements: [
            {
                view: "layout", 
                cols: [
                    {
                        margin:10,
                        rows: [
                            {view: "text", label: "Kode barang", name: "kode_barang"}, 
                            {view: "text", label: "Nama barang", name: "nama"},
                            {view: "counter", label: "Stok", name: "stok", min: 1}
                        ]
                    },
                    {width: 30},
                    {
                        margin:10,
                        rows: [
                            {
                                view: "text",
                                type: 'number',
                                label: "Harga beli", 
                                name: "harga_beli", 
                                on: {
                                    // ganti type jangan number kena batas angka
                                    onTimedKeyPress: function () {
                                        let value = this.getValue();
                                        value = value.replace(/\D/g, '');
                                        value = formatCurrency(value);
                                        this.setValue(value);
                                    }
                                }
                            },
                            {
                                view: "text", 
                                type: 'number',
                                label: "Harga jual",
                                name: "harga_jual", 
                                on: {
                                    onTimedKeyPress: function () {
                                        let value = this.getValue();
                                        value = value.replace(/\D/g, '');
                                        value = formatCurrency(value);
                                        this.setValue(value);
                                        
                                    }
                                }
                            }
                        ]
                    },
                ]
            },
            { 
                id: "btnForm",
                view: "button", 
                value: "Tambah", 
                css:"webix_primary", 
                mode: "tambah",
                click: function(){
                    if($$("formData").validate()) {
                        data = $$("formData").getValues()                        
                        let parseHargaBeli = data["harga_beli"].replace(/\./g, '');
                        let parseHargaJual = data["harga_jual"].replace(/\./g, '');

                        data["harga_beli"] = parseHargaBeli
                        data["harga_jual"] = parseHargaJual
                        
                        if (this.config.mode === "tambah") {
                            webix.ajax().post('/barang/tambah-barang', data, function (text) {
                                windowTambahData.hide()
                                var result = JSON.parse(text);
                                var message = result.message;

                                if (result.status === 'success') {
                                    webix.alert({
                                        title:"Tambah Data Barang",
                                        text: message
                                    }).then(function(){
                                        window.location.href = '/barang';
                                    })
                                } else {
                                    webix.alert({
                                        type:"alert-error",
                                        title:"Tambah Data Barang",
                                        text: message
                                    })
                                }
                            })
                        } else if (this.config.mode === "ubah") {
                            webix.ajax().post('/barang/ubah-barang', data, function (text) {
                                windowTambahData.hide()
                                var result = JSON.parse(text);
                                var message = result.message;

                                if (result.status === 'success') {
                                    webix.alert({
                                        title:"Ubah Data Barang",
                                        text: message
                                    }).then(function(){
                                        window.location.href = '/barang';
                                    })
                                } else {
                                    webix.alert({
                                        type:"alert-error",
                                        title:"Ubah Data Barang",
                                        text: message
                                    })
                                }
                            })
                        }
                    } else {
                        webix.message("Data tidak boleh kosong!");
                    }
                }
            }
        ],
        rules:{
            "kode_barang":webix.rules.isNotEmpty,
            "nama":webix.rules.isNotEmpty,
            "stok":webix.rules.isNotEmpty,
            "harga_beli":webix.rules.isNotEmpty,
            "harga_jual":webix.rules.isNotEmpty
        },
        elementsConfig:{
            labelPosition:"top"
        }
    }
})


webix.ready(function(){   
    webix.ui.fullScreen();
    webix.ui({
        rows: [
            // ==============> Header <==============
            {view: "toolbar", padding: 10, paddingX: 10, elements: [
                {view: "icon", icon: "mdi mdi-menu", width: 40, css: "icon_hamburger", click: function(){
                    $$("$sidebar1").toggle();
                 }
                },
                {view: "label", label: "KasirKu", css: "header_title"}
            ]},
            // =============> Main <===============
            {cols: [
                {
                    view:"sidebar",
                    collapsedWidth: 62,
                    border: true,
                    width: 200,
                    css: "sidebar_custom",
                    data: menu_data, 
                    on:{
                        onAfterSelect: function(id){
                            webix.message("Selected: "+this.getItem(id).value);

                            let selectedMenu = this.getItem(id);

                            if(selectedMenu.link){
                                window.location.href = selectedMenu.link
                            }
                        }
                    }
                },
                // ==========> Main Menu Content <==========
                {type: "line", rows: [ 
                    // =========> Header Menu Content <=========== (belum responsive di width screen 650)
                   {minHeight: 60, cols: [
                        {view: "label", label: "MENU DATA BARANG", css: "custom_header_menu"},
                        {
                            id:"currentTime",
                            template: function(){     
                                webix.i18n.parseTimeFormat = "%H:%i";
                                webix.i18n.setLocale();
                                return strDate + "<span>&emsp;</span>" + webix.i18n.parseTimeFormatStr(new Date());
                            }, 
                            type: "clean", 
                            css: "text_right custom_header_time"
                        }
                    ]},
                    {
                        view: "toolbar",
                        id: "myToolbar",
                        maxHeight: 50,
                        paddingX: 10,
                        paddingY: 15,
                        margin: 15,
                        cols:[
                            {id:"filter-table", view:"text", label:"Cari Data", placeholder:"Kode dan nama barang", labelPosition: "top", maxWidth: 200},
                            {id:"filter-number", view:"text", type: "number", label: "Filter Stok", placeholder:"Stok kurang dari", labelPosition: "top", maxWidth: 150 },
                            {},
                            {maxHeight: 90, margin: 10, cols: [
                                {rows: [
                                    {},
                                    { 
                                        view:"button", 
                                        type:"icon", 
                                        icon: "mdi mdi-plus", 
                                        label: "Tambah", 
                                        width: 100, 
                                        height: 50,
                                        align: "center", 
                                        css: "webix_primary", 
                                        click:function(){
                                            $$("table-barang").unselectAll();
                                            $$("formData").clear();
                                            $$("windowData").getHead().getChildViews()[0].setHTML("Tambah Data")
                                            $$("btnForm").define("label", "Tambah");
                                            $$("btnForm").define("mode", "tambah");
                                            $$("btnForm").refresh();
                                            windowTambahData.show()
                                        }
                                    },
                                ]},
                                {rows: [
                                    {},
                                    { 
                                        view:"button", 
                                        type:"icon", 
                                        icon: "mdi mdi-pencil", 
                                        label: "Ubah", 
                                        width: 100, 
                                        align: "center", 
                                        css: "webix_secondary", 
                                        value: "edit",
                                        height: 50,    
                                        click: function(){
                                            let selectedItem = $$("table-barang").getSelectedItem();
                                            if (selectedItem) {
                                                $$("formData").setValues(selectedItem);                                                
                                                $$("windowData").getHead().getChildViews()[0].setHTML("Edit Data");
                                                $$("btnForm").define("label", "Ubah");
                                                $$("btnForm").define("mode", "ubah");
                                                $$("btnForm").refresh();
                                                windowTambahData.show();
                                            } else {
                                                webix.message("Pilih baris data untuk diedit!");
                                            }
                                        }
                                    }
                                ]},
                                {rows: [
                                    {},
                                    {
                                        view:"button", 
                                        type:"icon", 
                                        icon: "mdi mdi-delete", 
                                        label: "Hapus", 
                                        width: 100, 
                                        align: "center", 
                                        css: "webix_danger", 
                                        height: 50,
                                        click: function(){
                                            let selectedId = $$('table-barang').getSelectedId();

                                            if (selectedId) {
                                                webix.confirm({
                                                    title: "Konfirmasi Hapus Data",
                                                    type:"confirm-warning",
                                                    ok: "Hapus", 
                                                    cancel: "Batal",
                                                    text: "Apakah anda yakin untuk menghapus data ini?"
                                                }).then(function(result){
                                                    let dataBarang = $$("table-barang").getItem(selectedId);
                                                    let dictKodeBarang = {
                                                        "kode_barang": dataBarang.kode_barang
                                                    }

                                                    webix.ajax().post('/barang/hapus-barang', dictKodeBarang, function (text) {
                                                        var result = JSON.parse(text);
                                                        var message = result.message;

                                                        if (result.status === 'success') {
                                                            webix.alert({
                                                                title:"Hapus Data Barang",
                                                                text: message
                                                            }).then(function(){
                                                                window.location.href = '/barang';
                                                            })
                                                        } else {
                                                            webix.alert({
                                                                type:"alert-error",
                                                                title:"Hapus Data Barang",
                                                                text: message
                                                            })
                                                        }
                                                    })
                                                })
                                            } else {
                                                webix.message("Pilih baris untuk dihapus");
                                            }
                                        }
                                    }
                                ]},
                                {}
                            ]}
                          
                        ]
                    },
                    {
                        id: "table-barang",
                        view: "datatable",
                        css: "webix_header_border webix_data_border",
                        columns: [
                            {id: "no",             header: "No",          sort:"int",  autoIncrement: true,  width: 60},
                            {id: "kode_barang",    header: "Kode Barang", sort:"text", fillspace: 1},
                            {id: "nama",    header: "Nama Barang", sort:"text", fillspace: 4},
                            {id: "harga_beli",     header: "Harga Beli",  sort:"int",  fillspace: 2, css: "text_right", 
                                template: function(obj){
                                    return formatCurrency(obj.harga_beli)
                                }
                            },
                            {id: "harga_jual",     header: "Harga Jual",  sort:"int",  fillspace: 2, css: "text_right", 
                                template: function(obj){
                                    return formatCurrency(obj.harga_jual)
                                }
                            },
                            {id: "stok",    header: "Stok",        sort:"int",  fillspace: 2, css: "text_right"}
                        ],
                        scheme: {
                            $init: function(obj) {
                                obj.no = this.count();
                            }
                        },
                        url: "/get-barang",
                        autoWidth: true,
                        maxHeight: 1000,
                        select: true,
                        scroll: "y",
                        onClick: {
                            "wxi-trash": function(event, id, node){
                                this.remove(id)
                            }
                        }
                    }
                ]}
            ]}
        ]
    });   


    // filter nama barang, id, jenis
    $$("filter-table").attachEvent("onTimedKeypress", function(){
        var text = this.getValue().toString().toLowerCase();
        $$("table-barang").filter(function(obj){
            var filter = [obj.nama, obj.kode_barang].join("|");
            filter = filter.toString().toLowerCase();
            return (filter.indexOf(text) != -1);
        });
    });

    // // filter stok
    $$("filter-number").attachEvent("onTimedKeypress", function(){
        var inputStok = this.getValue();
        $$("table-barang").filter(function(obj){
            if(inputStok === "" || inputStok === null){
                return obj;
            }
            return obj.stok < inputStok;
        });
    });            

    function responsiveSidebar() {
        var width = document.body.offsetWidth;
        if (width <= 1000) {
            $$("$sidebar1").collapse();
        } else {
            $$("$sidebar1").expand();
        }
    }

    webix.event(window, "resize", function () {
        responsiveSidebar();
    });

    responsiveSidebar();
});