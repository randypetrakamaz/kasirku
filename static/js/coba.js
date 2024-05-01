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
                // =========> Sidebar <===========
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
                    // =========> Form Transaction and Date <===========
                    {id: "transaction_section", rows: [
                        {responsive: "transaction_section", height: 150, cols: [
                            // ======> Form Transaction <=======
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
                                        // ========> Button CRUD Transaksi <========
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
                            // ======> Display Total <======
                            {id: "displayTotal", template: "<p>Rp #total#</p>", minWidth: 350, gravity: 3, css: "text_right custom_total"}
                        ]}
                    ]},                    
                    {responsive: "transaction_section", rows: [
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
                                {id: "aksi", header: "", template: "{common.trashIcon()}", css: {"text-align": "center"}}
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
                        {
                            view: "form",
                            css: "custom_label",
                            elements: [
                                {cols: [
                                    {gravity: 2, margin: 10, rows: [
                                        {id: "bayar", view: "text", name: "bayar", label: "Bayar", labelWidth: 110, inputWidth: 380, placeholder: "Masukkan nominal pembayaran", css: "custom_form", function: validateBayar},
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
                    ]},
                ]}
            ]}
        ],
    })






    // Konfigurasi, function dan lain lain yang tidak berhubungan langsung dengan UI
    setInterval(function(){
        $$("currentTime").refresh()
    }, 1000);
    
    $$("formTransaksi").bind("tableTransaksi")
    $$("tableTransaksi").attachEvent("onAfterSelect", function(id){
        let inputKodeBarang = $$("formTransaksi").getValues().kode_barang
        let kodeBarang = $$("tableTransaksi").getItem(id).kode_barang
        $$("kode_barang").setValue(kodeBarang);
    });

    // tambah data
    function tambahData(){
        let formValues = $$("formTransaksi").getValues();
        let datatable = $$("tableTransaksi");
        let kodeBarang = $$("kode_barang").getInputNode().value;

        // Validasi bahwa semua kolom form diisi
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
                // let newJumlah = parseInt(existingItem.jumlah_barang, 10) + parseInt(formValues.jumlah_barang, 10);
                // datatable.updateItem(existingItem.id, { jumlah_barang: newJumlah });
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

    // hitung total beli
    function totalBeli(){
        let total = 0;
        $$("tableTransaksi").data.each(function (item) {
            total += item.harga_jual * item.jumlah_barang;
        });
        return total
    }
    
    // update total beli
    function updateTotal(){
        let total = totalBeli();
        $$("displayTotal").define("template", "<p>Rp " + formatCurrency(total) + "</p>");
        $$("displayTotal").refresh();
    }

    // hitung kembalian
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

    // validate bayar
    function validateBayar(){
        let kembalian = $$("kembalian").getValue()
        if(kembalian < 0) {
            webix.message("Harap bayar sesuai nominal")
        }
        else {
            webix.message("Pembayaran berhasil")

            webix.print(
                $$("tableTransaksi"), 
                {
                    paper: "thermal",
                    docHeader: `
                    <html>
                        <head>
                            <title>Struk Kasir</title>
                            <style>
                                @media print {
                                    @page {
                                        size: 80mm 200mm;
                                        margin: 0;
                                    }

                                    *{
                                        font-size: 14px;
                                        margin-bottom: 10px;
                                    }

                                    .content {
                                        padding: 6px;
                                    }

                                    h3 {
                                        font-size: 20px;
                                    }

                                    .height-18 {
                                        line-height: 18px;
                                    }

                                    .text-right {
                                        text-align: right;
                                    }
                                    .text-left {
                                        text-align: left;
                                    }
                                    hr {
                                        border: 1px dashed black;
                                    }

                                    table {
                                        width: 100%;
                                        border-collapse: collapse;
                                    }
                                }

                                .content {
                                    margin: 15px;
                                }

                                body {
                                    width: 302.362205px;
                                    height: 75.590551px;
                                    margin: auto;
                                }

                            </style>
                        </head>

                        <body>
                            <div class="content">
                                <!-- header -->
                                <center>
                                    <h3>Toko Kembar</h3>
                                    <p class="height-18"> Jl. Kudus - Purwodadi No.km No.10, Brati<br>
                                        Grobogan<br>
                                        Telp. 086432242
                                    </p>
                                </center>
                                <hr>

                                <!-- tanggal dan no.struk -->
                                <table>
                                    <tr>
                                        <td class="text-left">20-10-2020</td>
                                        <td class="text-right">No.23221391999</td>
                                    </tr>
                                    <tr>
                                        <td class="text-left">10:41</td>
                                        <td></td>
                                    </tr>
                                </table>
                                <hr>

                                <!-- item barang dan harga -->
                                <table>
                                    <tr>
                                        <td class="text-left">Indomie goreng</td>
                                    </tr>
                                    <tr>
                                        <td class="text-left">1 x 3.500</td>
                                        <td class="text-right">76.000</td>
                                    </tr>
                                    <tr>
                                        <td class="text-left">Ultra Milk 1L</td>
                                    </tr>
                                    <tr>
                                        <td class="text-left">1 x 20.000</td>
                                        <td class="text-right">76.000</td>
                                    </tr>
                                </table>
                                <hr>

                                <!-- Total -->
                                <table>
                                    <tr>
                                        <td class="text-left">Total</td>
                                        <td class="text-right">200.000</td>
                                    </tr>
                                    <tr>
                                        <td class="text-left">Bayar</td>
                                        <td class="text-right">200.000</td>
                                    </tr>
                                    <tr>
                                        <td class="text-left">Kembalian</td>
                                        <td class="text-right">0</td>
                                    </tr>
                                </table>
                            </div>
                        </body>

                    </html>
                    `,
                    docFooter: `
                    <center>
                        <div>Terima kasih telah belanja disini!</div>
                    </center>
                    `,
                    header: "false",
                    footer: "false",
                    borderless: "true",

                }
            )
            

            // let printWindow = window.open('', '_blank');
            // let content = `
            // <html>
            //     <head>
            //         <title>Struk Kasir</title>
            //         <style>
            //             @media print {
            //                 @page {
            //                     size: 80mm 200mm;
            //                     margin: 0;
            //                 }

            //                 *{
            //                     font-size: 14px;
            //                     margin-bottom: 10px;
            //                 }

            //                 .content {
            //                     padding: 6px;
            //                 }

            //                 h3 {
            //                     font-size: 20px;
            //                 }

            //                 .height-18 {
            //                     line-height: 18px;
            //                 }

            //                 .text-right {
            //                     text-align: right;
            //                 }

            //                 hr {
            //                     border: 1px dashed black;
            //                 }

            //                 table {
            //                     width: 100%;
            //                     border-collapse: collapse;
            //                 }
            //             }

            //             .content {
            //                 margin: 15px;
            //             }

            //             body {
            //                 width: 302.362205px;
            //                 height: 75.590551px;
            //                 margin: auto;
            //             }
            //         </style>
            //     </head>

            //     <body>
            //         <div class="content">
            //             <center>
            //                 <h3>Toko Kembar</h3>
            //                 <p class="height-18"> Jl. Kudus - Purwodadi No.km No.10, Brati<br>
            //                     Grobogan<br>
            //                     Telp. 086432242
            //                 </p>
            //             </center>
            //             <hr>

            //             <table>
            //                 <tr>
            //                     <td>20-10-2020</td>
            //                     <td class="text-right">No.23221391999</td>
            //                 </tr>
            //                 <tr>
            //                     <td>10:41</td>
            //                     <td></td>
            //                 </tr>
            //             </table>
            //             <hr>

            //             <table>
            //                 <tr>
            //                     <td>Indomie goreng</td>
            //                 </tr>
            //                 <tr>
            //                     <td>1 x 3.500</td>
            //                     <td class="text-right">76.000</td>
            //                 </tr>
            //                 <tr>
            //                     <td>Ultra Milk 1L</td>
            //                 </tr>
            //                 <tr>
            //                     <td>1 x 20.000</td>
            //                     <td class="text-right">76.000</td>
            //                 </tr>
            //             </table>
            //             <hr>

            //             <table>
            //                 <tr>
            //                     <td>Total</td>
            //                     <td class="text-right">200.000</td>
            //                 </tr>
            //                 <tr>
            //                     <td>Bayar</td>
            //                     <td class="text-right">200.000</td>
            //                 </tr>
            //                 <tr>
            //                     <td>Kembalian</td>
            //                     <td class="text-right">0</td>
            //                 </tr>
            //             </table>
            //             <br>

            //             <center>
            //                 <div>Terima kasih telah belanja disini!</div>
            //             </center>
            //         </div>
            //     </body>
            // </html>
            // `;
            // printWindow.document.write(content);
            // printWindow.document.close();
            // printWindow.document.getElementsByTagName('body')[0].classList.add('print-only');
            // printWindow.print();
        }
    }

    // konfigurasi print
    webix.env.printMargin = 96*0.25;
    webix.env.printSizes = [
        {id: "thermal", width: 3.14961, height:7.87402}
    ];

    // format currency menambahkan '.' setiap ribuan
    function formatCurrency(value) {
        return webix.Number.format(value, {
            groupSize: 3,
            groupDelimiter: ".",
            decimalSize: 0,
            decimalDelimiter: ","
        });
    }

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
})