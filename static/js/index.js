let menu_data = [
	{id: "dashboard", icon: "mdi mdi-cart-outline", width: 20, value: "Dashboards", link: "/"},
	{id: "riwayat", icon: "mdi mdi-history", value: "Riwayat", link: "/riwayat"},
	{id: "barang", icon: "mdi mdi-semantic-web", value: "Data Barang", link: "/barang"}
];

let format = webix.Date.dateToStr("%d/%M/%Y");
let strDate = format(new Date());

let dateFormatNumber = webix.Date.dateToStr("%d-%m-%Y");
let strDateNumber = dateFormatNumber(new Date());

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

function clickToggleMenu(){
    $$("sidebar_menu").toggle();
}

function switchMenu(id){
    let selectedMenu = this.getItem(id);
    if(selectedMenu.id != "dashboard"){
        window.location.href = selectedMenu.link;
    }
}

function showDateTime(){     
    webix.i18n.parseTimeFormat = "%H:%i";
    webix.i18n.setLocale();

    setInterval(function(){
        $$("current_time").refresh()
    }, 1000);

    return strDate + "<span>&emsp;</span>" + webix.i18n.parseTimeFormatStr(new Date());
}

let combolistOptions = {
    body: {
        url: "/get-barang",
        template: "#kode_barang#",
        yCount: 3,
        on: {
            onItemClick: function(id){
                let nama_barang = this.getItem(id).nama;
                $$("nama").setValue(nama_barang);
                $$("jumlah").focus();
            }
        }
    },
    filter: function(item, value) {
        return item.kode_barang.toString().toUpperCase().indexOf(value.toUpperCase()) === 0;
    }
}

function formatCurrency(value) {
    return webix.Number.format(value, {
        groupSize: 3,
        groupDelimiter: ".",
        decimalSize: 0,
        decimalDelimiter: ","
    });
}

function currencyHargaJual(obj){ 
    return formatCurrency(obj.harga_jual)
}

function currencyJumlahBarang(obj){ 
    return formatCurrency(obj.jumlah_barang)
}

function currencyTotal(obj){ 
    return formatCurrency(obj.total)
}

function addData(){
    let datatable = $$("transaction_table");
    let formValues = $$("transaction_form").getValues();
    let namaBarang = formValues.nama;
    let stokBarang = formValues.jumlah_barang;
    let kodeBarang = $$("kode_barang").getInputNode().value;

    if (kodeBarang && namaBarang && stokBarang) {
        let existingItem = null;

        for (let i = 0; i < datatable.count(); i++) {
            let item = datatable.getItem(datatable.getIdByIndex(i));
            if(item.kode_barang === kodeBarang) {
                existingItem = item;
                break;
            }
        }

        if (existingItem) {
            webix.message({type: "error", text: "Barang sudah ditambahkan! Silahkan hapus jika ingin mengubah data"});
        } else {
            webix.ajax().get("/get-barang",  function(text, data) {
                let responseData = data.json()["data"];
                let statusFindData = false
                for(let data of responseData){
                    if(data.kode_barang == kodeBarang && data.stok >= stokBarang){
                        let item = {
                            "no": datatable.count()+1,
                            "kode_barang": kodeBarang,
                            "nama": namaBarang,
                            "harga_jual": data.harga_jual,
                            "jumlah_barang": stokBarang
                        }
                        datatable.add(item);
                        statusFindData = true;
                        break;
                    }
                }

                if(!statusFindData) {
                    webix.message({type: "error", text: "Jumlah barang melebihi stok!"});
                }
            })
        }
        updateTotal();
        $$("transaction_form").clear();
    } else {
        webix.message({type: "error", text: "Harap isi semua kolom form!"});
    }
}

function resetData(){
    $$("transaction_form").clear()
}

function updateTotal(){
    let total = totalBuy();
    
    if(total == 0){
        $$("transaction_table").showOverlay("Tidak ada data"); 
    } else {
        $$("transaction_table").hideOverlay(); 
    }
    $$("display_total").define("template", "<p>Rp " + formatCurrency(total) + "</p>");
    $$("display_total").refresh();
}

function totalBuy(){
    let total = 0;
    $$("transaction_table").data.each(function (item) {
        total += item.harga_jual * item.jumlah_barang;
    });
    return total
}

function deleteDatatable(event, id, node) {
    let selectedId = id;
    webix.confirm({
        title: "Konfirmasi Hapus Data",
        type:"confirm-warning",
        ok: "Hapus", 
        cancel: "Batal",
        text: "Apakah anda yakin untuk menghapus data ini?"
    }).then(function(){
        $$('transaction_table').remove(selectedId);
    })
}

function calculateChange() {
    let total = totalBuy();
    let bayar = $$("pay").getValue();        
    bayar = bayar.replace(/\./g, '');

    if(bayar && !isNaN(bayar) && total > 0) {
        let kembalian = bayar - total;
        if(kembalian < 0){
            webix.message({type: "error", text: "Total bayar tidak boleh kurang dari total beli!"});

            $$("pay").focus();
            $$("button_form").clear();
            $$("print_btn").disable();
        } else {
            value = bayar.replace(/\D/g, '');
            value = formatCurrency(value);
            $$("pay").setValue(value);
            $$("change").setValue(formatCurrency(kembalian));
            $$("print_btn").enable();
        }
    } else {
        $$('pay').setValue("");
        $$("change").setValue("");
        $$("print_btn").disable();
    }
}

function cancelTransaction(){
    $$("transaction_form").clear();
    $$("transaction_table").clearAll();
    $$("pay").setValue("");
    $$("change").setValue("");
}

function printReceipt(no, bayar, kembalian, total){
    let dataFromDatatable = $$("transaction_table").serialize();
    let time = webix.i18n.parseTimeFormatStr(new Date());        
    let totalBuy = formatCurrency(total);
    let pay = bayar;
    let change = kembalian;
    let noTransaksi = no;

    let printWindow = window.open('', '', 'height=600, width=800');
    let headHtml = `
        <head>
            <title>Struk Kasir</title>
            <style>
                @media print {
                    @page {
                        size: 80mm 210mm;
                        margin: 0;
                    }
                    *{
                        font-size: 14px;
                        margin-bottom: 10px;
                    }
                    .content {
                        padding: 6px;
                    }
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
    `;
    let headerReceipt = `
        <!-- header -->
        <center>
            <h3>Toko Kembar</h3>
            <p class="height-18"> Jl. Purwodadi-Kudus Km. 10, Brati<br>
                Grobogan<br>
                Telp. 085432242322
            </p>
        </center>
        <hr>

        <!-- tanggal dan no.struk -->
        <table>
            <tr>
                <td class="text-left">${strDateNumber}</td>
                <td class="text-right">${noTransaksi}</td>
            </tr>
            <tr>
                <td class="text-left">${time}</td>
                <td></td>
            </tr>
        </table>
        <hr>
    `;
    let startDatatableReceipt = `
        <!-- item barang dan harga -->
        <table>
    `;
    dataFromDatatable.forEach(function(item) {
        startDatatableReceipt += `
            <tr>
                <td class="text-left">${item.nama}</td>
            </tr>
            <tr>
                <td class="text-left">&nbsp;&nbsp;&nbsp; ${formatCurrency(item.jumlah_barang)} x ${formatCurrency(item.harga_jual)}</td>
                <td class="text-right">&nbsp;&nbsp;&nbsp; ${formatCurrency(item.total)}</td>
            </tr>
        `;              
    });
    let endDatatableReceipt = `
        </table>
        <hr></hr>
    `;
    let totalReceipt = `
        <!-- Total -->
        <table>
            <tr>
                <td class="text-left">Total</td>
                <td class="text-right">${totalBuy}</td>
            </tr>
            <tr>
                <td class="text-left">Bayar</td>
                <td class="text-right">${pay}</td>
            </tr>
            <tr>
                <td class="text-left">Kembalian</td>
                <td class="text-right">${change}</td>
            </tr>
        </table>  
    `;

    let layoutPrint = `
    <html>
        ${headHtml}
        <body>
            <div class="content">
                ${headerReceipt}
                ${startDatatableReceipt}
                ${endDatatableReceipt}
                ${totalReceipt}
                <br>
                <!-- footer -->
                <center>
                    <div>Terima kasih telah belanja disini!</div>
                </center>
            </div>
        </body>
    </html>
    `;

    printWindow.document.write(layoutPrint);
    printWindow.document.close();
    printWindow.print();
}

function generateTransactionNumber() {
    let currentDate = new Date();
    let year = String(currentDate.getFullYear()).slice(-2); // Mendapatkan 2 digit terakhir dari tahun
    let month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Bulan (misalnya: 03)
    let day = String(currentDate.getDate()).padStart(2, '0'); // Hari (misalnya: 25)
    let hours = String(currentDate.getHours()).padStart(2, '0'); // Jam (misalnya: 14)
    let minutes = String(currentDate.getMinutes()).padStart(2, '0'); // Menit (misalnya: 30)
    let seconds = String(currentDate.getSeconds()).padStart(2, '0'); // Detik (misalnya: 45)

    return `TK${year}${month}${day}${hours}${minutes}${seconds}`;
}

function saveToDatabase(no, total, bayar, kembalian){
    let dataFromDatatable = $$("transaction_table").serialize();
    let totalBuy = total;
    let pay = bayar.replace(/\./g, '');
    let change = kembalian.replace(/\./g, '');
    let no_transaksi = no;
    let time = webix.i18n.parseTimeFormatStr(new Date()); 
    let dataItems = []

    dataFromDatatable.forEach(function(item){
        dataItems.push({
            "kode_barang": item["kode_barang"],
            "nama_barang": item["nama"], 
            "jumlah": item["jumlah_barang"], 
            "harga": item["harga_jual"]
        })
    })
    let data = {
        "no_transaksi": no_transaksi,
        "tanggal": strDateNumber + " " + time,
        "items": dataItems,
        "total": totalBuy,
        "bayar": pay,
        "kembalian": change
    };

    webix.ajax().headers({"Content-Type": "application/json"}).post('/tambah-riwayat', JSON.stringify(data), function(text) {
        let result = JSON.parse(text);
        let message = result.message;

        if (result.status === 'success') {
            webix.message({type: "success", text: message});
            cancelTransaction();
            printReceipt(no_transaksi, pay, change, totalBuy);
        } else {
            webix.alert({
                type:"alert-error",
                title:"Transaksi Pembelian",
                text: message
            })
        }
    });
}

function confirmTransaction(){
    let totalBayar = $$("pay").getValue();
    let kembalian = $$("change").getValue();
    let total = totalBuy();
    let noTransaksi = generateTransactionNumber();

    let dialogText = `
        <div>Total Bayar: ${totalBayar}</div>
        <div>Kembalian: ${kembalian}</div>
        <br>
        <div>Apakah data sudah sesuai dan siap untuk dicetak?</div>
        <br>
    `;

    webix.confirm({
        title: "Transaksi Pembayaran",
        ok: "Cetak", 
        cancel: "Batal",
        text: dialogText
    }).then(function(){
        saveToDatabase(noTransaksi, total, totalBayar, kembalian)
    });
}


webix.ready(function(){
    webix.ui({
        rows: [
            // =====> Header <=====
            {
                id: "header",
                view: "toolbar", 
                padding: 10,  
                css: "bg_blue header",
                elements: [
                    {id: "iconMenu", view: "icon", icon: "mdi mdi-menu", width: 40, css: "icon_hamburger", click: clickToggleMenu},
                    {id: "appName", view: "label", label: "KasirKu", css: "header_title"}
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
                        collapsedWidth: 62, 
                        css: "sidebar_custom ",
                        data: menu_data, 
                        on: {onAfterSelect: switchMenu}
                    },
                    // =====> Main Content <=====
                    {
                        rows: [
                            // =====> Menu Name & Datetime <===== (belum responsive di width screen 650)
                            {
                                minHeight: 60,
                                css: "bg_gray",
                                cols: [
                                    {id: "label_menu", view: "label", label: "MENU TRANSAKSI KASIR", css: "custom_header_menu"},
                                    {id:"current_time", template: showDateTime, type: "clean", css: "text_right custom_header_time"}
                                ]
                            },
                            { 
                                borderless: true,
                                type: "space", 
                                rows: [
                                    {
                                        rows: [
                                            // =====> Form Transaction & Total <=====
                                            {
                                                id: "transaction_section", 
                                                rows: [
                                                    {
                                                        responsive: "transaction_section",
                                                        height: 150, 
                                                        cols: [
                                                            // ======> Form Transaction & Total <=======
                                                            {
                                                                id: "transaction_form",
                                                                view: "form", 
                                                                minWidth: 600,
                                                                gravity: 4,
                                                                elements: [
                                                                    {
                                                                        cols: [
                                                                            {
                                                                                minWidth: 400,
                                                                                rows: [
                                                                                    {id: "kode_barang", view: "combo", label: 'Kode Barang', name: "kode_barang", placeholder: "Masukkan kode barang", labelWidth: 110, inputWidth: 380, css: "custom_form",options: combolistOptions},
                                                                                    {id: "nama", view:"text", label:"Nama Barang", name:"nama", placeholder: "None", labelWidth: 110, inputWidth: 380,  css: "custom_form", readonly: true},
                                                                                    {id: "jumlah", view:"counter", label:"Jumlah", name:"jumlah_barang", labelWidth: 110, value: 1}
                                                                                ]
                                                                            },
                                                                            // ======> Button Tambah, Ubah, Reset <=======
                                                                            {
                                                                                margin: 5, 
                                                                                width: 200, 
                                                                                minWidth: 200, 
                                                                                rows:[
                                                                                    {},
                                                                                    {view: "button", value: "Tambah", css: "webix_primary", click: addData},
                                                                                    {view: "button", value: "Reset",  css: "webix_danger", click: resetData}
                                                                                ]
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                            },
                                                            // =====> Display Total <=====
                                                            {id: "display_total", template: "<p>Rp #total#</p>", minWidth: 350, gravity: 3, css: "text_right custom_total"}
                                                        ]
                                                    },
                                                    // ======> Table Transaction <=======
                                                    {
                                                        responsive: "transaction_section", 
                                                        id: "transaction_table",
                                                        view: "datatable", 
                                                        css:"webix_header_border webix_data_border",
                                                        columns: [
                                                            {id: "no", header: "No", width: 40},
                                                            {id: "kode_barang", header: "Kode Barang", fillspace: 1},
                                                            {id: "nama", header: "Nama Barang", fillspace: 4},
                                                            {id: "harga_jual", header: "Harga", fillspace: 2, css: "text_right", template: currencyHargaJual},
                                                            {id: "jumlah_barang",  header: "Jumlah", fillspace: 2, css: "text_right", template: currencyJumlahBarang},
                                                            {id: "total", header: "Total", fillspace: 2, math:"[$r, harga_jual] * [$r, jumlah_barang]", css: "text_right", template: currencyTotal},
                                                            {id: "aksi", header: "", template: "{common.trashIcon()}", css: "text_center"}
                                                        ],
                                                        math: true,
                                                        autoWidth: true,
                                                        minHeight: 200,
                                                        maxHeight: 250,
                                                        scroll: "y",
                                                        onClick: {"wxi-trash": deleteDatatable},
                                                        on: {
                                                            onAfterRender: updateTotal,
                                                            onAfterLoad: updateTotal,
                                                            onDataUpdate: updateTotal,
                                                            onAfterDelete: updateTotal
                                                        }
                                                    }
                                                ]
                                            }, 
                                            // =====> Button form bawah <======
                                            {
                                                id: "button_form",
                                                view: "form",
                                                css: "custom_label",
                                                elements: [
                                                    {
                                                        cols: [
                                                            {
                                                                gravity: 2, 
                                                                margin: 10, 
                                                                rows: [
                                                                    {id: "pay", view: "text", label: "Bayar", name: "bayar", placeholder: "Masukkan nominal pembayaran", labelWidth: 110, inputWidth: 380,css: "custom_form", 
                                                                        on: {
                                                                            onEnter: function(){calculateChange()},
                                                                            onBlur: function(){calculateChange()}
                                                                        }
                                                                    },
                                                                    {id: "change", view: "text", name: "kembalian", label: "Kembali", labelWidth: 110, inputWidth: 380, css: "custom_form", readonly: true},
                                                                ]
                                                            },
                                                            {
                                                                margin: 10, 
                                                                rows:[
                                                                    {id: "print_btn", view:"button", value:"Cetak", maxWidth: 245, height: 45, css:"webix_primary", click: confirmTransaction, disabled: true},
                                                                    {view:"button", value:"Batal", maxWidth: 245, height: 45, css: "webix_danger", click: cancelTransaction}
                                                                ]
                                                            }
                                                        ]
                                                    },
                                                ],
                                                rules: {
                                                    pay: webix.rules.isNumber
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
        ]
    })

    $$("transaction_form").bind("transaction_table");
    $$("sidebar_menu").select("dashboard");
    responsiveSidebar();
    webix.message.expire = 1800;
});