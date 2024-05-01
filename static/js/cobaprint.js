let menu_data = [
    {id: "dashboard", icon: "mdi mdi-cart-outline", width: 20, value: "Dashboards", link: "/"},
    {id: "riwayat", icon: "mdi mdi-history", value: "Riwayat", link: "/riwayat"},
    {id: "barang", icon: "mdi mdi-semantic-web", value: "Data Barang", link: "/barang"}
];

let format = webix.Date.dateToStr("%d/%M/%Y");
let strDate = format(new Date());

webix.ready(function(){
    webix.ui({
        rows: [
            // Header
            {view: "toolbar", padding: 10, paddingX: 10, elements: [
                {view: "icon", icon: "mdi mdi-menu", width: 40, css: "icon_hamburger", click: function(){
                    $$("$sidebar1").toggle();
                 }
                },
                {view: "label", label: "KasirKu", css: "header_title"}
            ]},
            // Main
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
                // Main Menu Content
                {type: "line", rows: [
                    // Header Menu Content
                   {minHeight: 60, cols: [
                        {view: "label", label: "MENU TRANSAKSI KASIR", css: "custom_header_menu"},
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
                    // Form Transaction and Date
                    {id: "transaction_section", rows: [
                        {responsive: "transaction_section", height: 150, cols: [
                            // Form Transaction
                            {
                                id: "formTransaksi",
                                view: "form", 
                                minWidth: 600,
                                gravity: 4,
                                elements: [
                                    {cols: [
                                        {minWidth: 400, rows: [
                                            {
                                                id: "kode_barang",
                                                view: "combo",
                                                labelWidth: 110,
                                                inputWidth: 380,
                                                label: 'Kode Barang',
                                                name: "kode_barang",
                                                placeholder: "Masukkan kode barang",
                                                options: {
                                                    body: {
                                                        url: "/get-barang",
                                                        data: [],
                                                        template: "#kode_barang#",
                                                        yCount: 3,
                                                        on: {
                                                            onItemClick: function(id){
                                                                let nama_barang = this.getItem(id).nama
                                                                $$("nama").setValue(nama_barang)
                                                                $$("jumlah").focus();
                                                            }
                                                        }
                                                    },
                                                    filter: function(item, value) {
                                                        return item.kode_barang.toString().toUpperCase().indexOf(value.toUpperCase()) === 0;
                                                    }
                                                },
                                                css: "custom_form",
                                            },
                                            {id: "nama", view:"text", name:"nama", label:"Nama Barang",  labelWidth: 110, inputWidth: 380, placeholder: "None", css: "custom_form", readonly: true},
                                            {id: "jumlah", view:"counter", name:"jumlah_barang", label:"Jumlah",  labelWidth: 110, value: 1}
                                        ]},
                                        // Button CRUD Transaksi
                                        {margin: 5, minWidth: 200, width: 200, rows:[
                                            {
                                                view: "button", 
                                                value: "Tambah", 
                                                css: "webix_primary",  
                                                click: function(){ 
                                                    tambahData();
                                                }
                                            },
                                            {
                                                view: "button", 
                                                value: "Ubah", 
                                                click: function(){ 
                                                    $$("formTransaksi").save();
                                                    $$("formTransaksi").clear();
                                                }
                                            },
                                            {
                                                view: "button", 
                                                value: "Reset",  
                                                css: "webix_danger", 
                                                click: function(){
                                                    $$("formTransaksi").clear();
                                                }
                                            }
                                        ]}
                                    ]}
                                ]
                            },
                            // Display Total
                            {id: "displayTotal", template: "<p>Rp #total#</p>", minWidth: 350, gravity: 3, css: "text_right custom_total"}
                        ]}
                    ]},                    
                    {responsive: "transaction_section", rows: [
                        // Table Transaksi
                        {
                            id: "tableTransaksi",
                            view:"datatable", 
                            css:"webix_header_border webix_data_border",
                            columns: [
                                    {id: "no",             header: "No",          width: 40},
                                    {id: "kode_barang",    header: "Kode Barang", fillspace: 1},
                                    {id: "nama",           header: "Nama Barang", fillspace: 4},
                                    {
                                        id: "harga_jual", 
                                        header: "Harga",
                                        fillspace: 2, 
                                        css: "text_right",
                                        template: function(obj){
                                            return formatCurrency(obj.harga_jual)
                                        }
                                    },
                                    {id: "jumlah_barang",  header: "Jumlah",      fillspace: 2, css: "text_right"},
                                    {
                                        id: "total",
                                        header: "Total",
                                        fillspace: 2,
                                        math:"[$r, harga_jual] * [$r, jumlah_barang]",
                                        css: "text_right",
                                        template: function(obj){
                                            return formatCurrency(obj.total)
                                        }
                                    },
                                {id: "aksi",           header: "",         template: "{common.trashIcon()}", css: {"text-align": "center"}}
                            ],
                            math: true,
                            select: true,
                            autoWidth: true,
                            maxHeight: 250,
                            scroll: "y",
                            onClick: {
                                "wxi-trash": function(event, id, node){
                                    let selectedId = id;
                                    webix.confirm({
                                        title: "Konfirmasi Hapus Data",
                                        type:"confirm-warning",
                                        ok: "Hapus", 
                                        cancel: "Batal",
                                        text: "Apakah anda yakin untuk menghapus data ini?"
                                    }).then(function(){
                                        $$('tableTransaksi').remove(selectedId);
                                    })
                                }
                            },
                            on: {
                                onAfterRender: function(){
                                    updateTotal()
                                },
                                onAfterLoad: function(){
                                    updateTotal();
                                },
                                onDataUpdate: function(){
                                    updateTotal();
                                },
                                onAfterDelete: function(){
                                    updateTotal();
                                }
                            }
                        },
                        // Form Pembayaran
                        {
                            view: "form",
                            css: "custom_label",
                            elements: [
                                {cols: [
                                    {gravity: 2, margin: 10, rows: [
                                        {id: "bayar", view: "text", name: "bayar", label: "Bayar", labelWidth: 110, inputWidth: 380, placeholder: "Masukkan nominal pembayaran", css: "custom_form"},
                                        {id: "kembalian", view: "text", name: "kembalian", label: "Kembali", labelWidth: 110, inputWidth: 380, css: "custom_form", readonly: true},
                                    ]},
                                    {margin: 10, rows:[
                                        {view:"button", value:"Bayar", maxWidth: 300, height: 50, css:"webix_primary", click: validateBayar},
                                        {view:"button", value:"Batal", maxWidth: 300, height: 50, css: "webix_danger", click: function(){
                                            $$("formTransaksi").clear();
                                            $$("tableTransaksi").clearAll();
                                        }}
                                    ]}
                                ]},
                            ],
                            rules: {
                                bayar: webix.rules.isNumber
                            },
                            on: {
                                onChange: function () {
                                    hitungKembalian();
                                }
                            }
                        }
                    ]}
                ]}
            ]}
        ],
    });

    // Menjalankan fungsi per detik untuk memperbarui waktu
    setInterval(function(){
        $$("currentTime").refresh()
    }, 1000);

    // Mengikat form dengan tabel transaksi
    $$("formTransaksi").bind("tableTransaksi");

    // Menjalankan perubahan pada form setelah seleksi pada tabel transaksi
    $$("tableTransaksi").attachEvent("onAfterSelect", function(id){
        let inputKodeBarang = $$("formTransaksi").getValues().kode_barang
        let kodeBarang = $$("tableTransaksi").getItem(id).kode_barang
        $$("kode_barang").setValue(kodeBarang);
    });

    // Fungsi tambah data
    function tambahData(){
        let formValues = $$("formTransaksi").getValues();
        let datatable = $$("tableTransaksi");
        let kodeBarang = $$("kode_barang").getInputNode().value;

        // Validasi semua kolom form diisi
        if (formValues.kode_barang && formValues.nama && formValues.jumlah_barang) {
            let existingItem = null;

            for (let i = 0; i < datatable.count(); i++) {
                let item = datatable.getItem(datatable.getIdByIndex(i));
                if(item.kode_barang === kodeBarang) {
                    existingItem = item;
                    break;
                }
            }

            if (existingItem) {
                webix.message("Barang sudah ditambahkan. Silahkan ubah data!");
            } else {
                webix.ajax().get("/get-barang",  function(text, data) {
                    let responseData = data.json()["data"];

                    for(let i in responseData){
                        if(responseData[i].kode_barang === kodeBarang){
                            let data = {
                                "no": datatable.count()+1,
                                "kode_barang": kodeBarang,
                                "nama": responseData[i].nama,
                                "harga_jual": responseData[i].harga_jual,
                                "jumlah_barang": formValues.jumlah_barang
                            }
                            $$("tableTransaksi").add(data);
                        }
                    }
                })
            }
            updateTotal();
            $$("formTransaksi").clear();
        } else {
            webix.message("Harap isi semua kolom form.");
        }
    }

    // Fungsi total beli
    function totalBeli(){
        let total = 0;
        $$("tableTransaksi").data.each(function (item) {
            total += item.harga_jual * item.jumlah_barang;
        });
        return total
    }
    
    // Fungsi update total beli
    function updateTotal(){
        let total = totalBeli();
        $$("displayTotal").define("template", "<p>Rp " + formatCurrency(total) + "</p>");
        $$("displayTotal").refresh();
    }

    // Fungsi hitung kembalian
    function hitungKembalian(){
        let total = totalBeli();
        let bayar = $$("bayar").getValue();

        if(bayar) {
            let kembalian = bayar - total;
            $$("kembalian").setValue(kembalian);
        } else {
            $$("kembalian").setValue("");
        }
    }

    // Fungsi validasi bayar
    function validateBayar(){
        let kembalian = $$("kembalian").getValue()
        if(kembalian < 0) {
            webix.message("Harap bayar sesuai nominal")
        }
        else {

            webix.message("Pembayaran berhasil")
            webix.print({
        html: printTemplate,
        data: $$('tableTransaksi').serialize(),
        total: totalBeli()
    });
        }
    }

    // Fungsi format currency menambahkan '.' setiap ribuan
    function formatCurrency(value) {
        return webix.Number.format(value, {
            groupSize: 3,
            groupDelimiter: ".",
            decimalSize: 0,
            decimalDelimiter: ","
        });
    }

    // Fungsi untuk responsif sidebar
    function responsiveSidebar() {
        var width = document.body.offsetWidth;
        if (width <= 1000) {
            $$("$sidebar1").collapse();
        } else {
            $$("$sidebar1").expand();
        }
    }

    // Mengikat event resize window untuk responsif sidebar
    webix.event(window, "resize", function () {
        responsiveSidebar();
    });

    // Menjalankan responsif sidebar
    responsiveSidebar();
})

// Template untuk mencetak isi tabel transaksi
let printTemplate = `
<div style="font-family: Arial, sans-serif;">
    <h2>Struk Transaksi</h2>
    <table style="width:100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #ddd; text-align: left;">
            <th style="padding: 8px;">No</th>
            <th style="padding: 8px;">Kode Barang</th>
            <th style="padding: 8px;">Nama Barang</th>
            <th style="padding: 8px;">Harga</th>
            <th style="padding: 8px;">Jumlah</th>
            <th style="padding: 8px;">Total</th>
        </tr>
        #foreach(obj in $$('tableTransaksi').serialize()){
            <tr>
                <td style="padding: 8px;">#obj.no#</td>
                <td style="padding: 8px;">#obj.kode_barang#</td>
                <td style="padding: 8px;">#obj.nama#</td>
                <td style="padding: 8px;">Rp #obj.harga_jual#</td>
                <td style="padding: 8px;">#obj.jumlah_barang#</td>
                <td style="padding: 8px;">Rp #obj.total#</td>
            </tr>
        #}#
    </table>
    <div style="text-align: right; margin-top: 20px;">
        <p>Total Belanja: Rp #total#</p>
    </div>
</div>
`;

// Mengikat fungsi cetak pada tombol "Cetak Struk"
// $$("printButton").attachEvent("onItemClick", function(){
//     webix.print({
//         html: printTemplate,
//         data: $$('tableTransaksi').serialize(),
//         total: totalBeli()
//     });
// });
