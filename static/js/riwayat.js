let menu_data = [
	{id: "dashboard", icon: "mdi mdi-cart-outline", width: 20, value: "Dashboards", link: "/"},
	{id: "riwayat", icon: "mdi mdi-history", value: "Riwayat", link: "/riwayat"},
	{id: "barang", icon: "mdi mdi-semantic-web", value: "Data Barang", link: "/barang"}
];

let format = webix.Date.dateToStr("%d/%M/%Y");
let strDate = format(new Date());

let dateFormatNumber = webix.Date.dateToStr("%d-%m-%Y");
let strDateNumber = dateFormatNumber(new Date());

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
        <h3 style="font-size: 20px">Toko Kembar</h3>
        <p style="line-height: 18px"> Jl. Purwodadi-Kudus Km. 10, Brati<br>
            Grobogan<br>
            Telp. 085432242322
        </p>
    </center>
`;
let footerReceipt = `
    <!-- footer -->
    <center>
        <div>Terima kasih telah belanja disini!</div>
    </center>
`

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
    if(selectedMenu.id != "riwayat"){
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

function formatCurrency(value) {
    return webix.Number.format(value, {
        groupSize: 3,
        groupDelimiter: ".",
        decimalSize: 0,
        decimalDelimiter: ","
    });
}

function getDataRiwayat(){
    webix.ajax().get("/riwayat/get-riwayat", function(text, data) {
        let dataTrx = data.json().data;
        let listDataTrx = [];
        let month_profit = 0;
        let month_revenue = 0;

        dataTrx.forEach(function(item){
            let splitDatetime = item["tanggal"].split(' '); 
            let date = splitDatetime[0]
            let time = splitDatetime[1]
            let strToDate = webix.Date.strToDate("%d-%m-%Y")(date)
            let dateToStr = webix.Date.dateToStr("%d-%M, %Y")(strToDate);
            let splitDate = dateToStr.split('-');
            let day = splitDate[0];
            let monthYear = splitDate[1];
            let profit = 0;
            
            item["items"].forEach(function(unit){
                profit +=  unit["jumlah"] * (unit["harga"] - unit["harga_beli"]);
            })
            
            listDataTrx.push({
                "no_transaksi": item["no_transaksi"],
                "day": day,
                "month_year": monthYear,
                "time": time,
                "revenue": formatCurrency(item["total"]),
                "profit": formatCurrency(profit)
            })
            
            month_profit += profit;
            month_revenue += item["total"]
        });

        listDataTrx.reverse();

        $$("list_transaction").parse(listDataTrx)
        $$("display_revenue").setValues({month_revenue: formatCurrency(month_revenue)})
        $$("display_profit").setValues({month_profit: formatCurrency(month_profit)})
    });
}

function filterDataRiwayat(selectedDate) { 
    let transactionList = $$("list_transaction")  
    let month_profit = 0;
    let month_revenue = 0;

    webix.extend(transactionList, webix.OverlayBox)
    transactionList.hideOverlay();
    $$("btn_close").hide()
    $$("btn_printer").hide()

    if (!selectedDate) {
        transactionList.clearAll();
        getDataRiwayat(); 
        return true;
    }

    transactionList.filter(function(obj) {
        let selectedDateList = obj.month_year;
        let dateObjectList = new Date(selectedDateList);
        dateObjectList.setDate(1);
        return dateObjectList.getTime() === selectedDate.getTime();
    })

    let filteredData = transactionList.serialize();
    if(transactionList.count() === 0) {
        transactionList.showOverlay("Tidak ada data");
    } else {
        filteredData.forEach(function(item){
            month_profit += Number(item.profit.replace(/\./g, ''));
            month_revenue += Number(item.revenue.replace(/\./g, ''));
        });
    }

    $$("display_revenue").setValues({month_revenue: formatCurrency(month_revenue)});
    $$("display_profit").setValues({month_profit: formatCurrency(month_profit)});

    $$("receipt_transaction").define("template", `<p style="text-align: center">Tidak ada data</p>`);
    $$("receipt_transaction").refresh();
}

function searchData(value) {
    let text = value.toString().toLowerCase();
    let transactionList = $$("list_transaction")

    transactionList.filter(function(obj) {
        return obj.no_transaksi.toString().toLowerCase().indexOf(text) != -1;
    }) 

    let filteredData = transactionList.serialize();
    let month_profit = 0
    let month_revenue = 0
    
    webix.extend(transactionList, webix.OverlayBox)
    transactionList.hideOverlay();

    $$("btn_close").hide()  
    $$("btn_printer").hide()
    $$("receipt_transaction").define("template", `<p style="text-align: center">Tidak ada data</p>`);
    $$("receipt_transaction").refresh();

    if(transactionList.count() === 0) {
        transactionList.showOverlay("Tidak ada data");
    } else {
        filteredData.forEach(function(item){
            month_profit += Number(item.profit.replace(/\./g, ''));
            month_revenue += Number(item.revenue.replace(/\./g, ''));
        });
    }

    $$("display_revenue").setValues({month_revenue: formatCurrency(month_revenue)});
    $$("display_profit").setValues({month_profit: formatCurrency(month_profit)});

}

function showReceiptView(data){    
    let dataReceipt = data

    let startDatatableReceipt = `
        <hr style="border: 1px dashed black">
        <!-- tanggal dan no.struk -->
        <table>
            <tr>
                <td style="text-align: left">${dataReceipt.tanggal}</td>
                <td style="text-align: right">${dataReceipt.no_transaksi}</td>
            </tr>
            <tr>
                <td style="text-align: left">${dataReceipt.waktu}</td>
                <td></td>
            </tr>
        </table>
        <hr style="border: 1px dashed black">

        <!-- item barang dan harga -->
        <table>
    `;
    dataReceipt["items"].forEach(function(item) {
        startDatatableReceipt += `
            <tr>
                <td style="text-align: left">${item.nama_barang}</td>
            </tr>
            <tr>
                <td style="text-align: left">&nbsp;&nbsp;&nbsp; ${formatCurrency(item.jumlah)} x ${formatCurrency(item.harga)}</td>
                <td style="text-align: right">&nbsp;&nbsp;&nbsp; ${formatCurrency(item.jumlah*item.harga)}</td>
            </tr>
        `;              
    });
    let endDatatableReceipt = `
        </table>
        <hr style="border: 1px dashed black">
    `;
    let totalReceipt = `
        <!-- Total -->
        <table style="width: 100%; border-collapse: collapse">
            <tr>
                <td style="text-align: left">Total</td>
                <td style="text-align: right">${dataReceipt.total}</td>
            </tr>
            <tr>
                <td style="text-align: left">Bayar</td>
                <td style="text-align: right">${dataReceipt.bayar}</td>
            </tr>
            <tr>
                <td style="text-align: left">Kembalian</td>
                <td style="text-align: right">${dataReceipt.kembalian}</td>
            </tr>
        </table>  
    `;

    let layoutPrint = `
        <div style="margin: 15px">
            ${startDatatableReceipt}
            ${endDatatableReceipt}
            ${totalReceipt}
            <br>
        </div>
    `;

    $$("receipt_transaction").define("template", layoutPrint);
    $$("receipt_transaction").refresh();
    return layoutPrint
}

function showReceipt(id){
    let item = $$("list_transaction").getItem(id);
    let noTrx = item.no_transaksi

    webix.ajax().get("/riwayat/get-riwayat", function(text, data){
        let dataTrx = data.json().data;

        for(let data of dataTrx){
            if(data.no_transaksi == noTrx){
                let datetime = data.tanggal.split(' ');
                let date = datetime[0];
                let time = datetime[1];        
                let totalBuy = formatCurrency(data.total);
                let pay = formatCurrency(data.bayar);
                let change = formatCurrency(data.kembalian);
                let noTransaksi = data.no_transaksi;
                let items = data.items;

                let dataReceipt = {
                    "no_transaksi": noTransaksi,
                    "tanggal": date,
                    "waktu": time,
                    "items": items,
                    "total": totalBuy,
                    "bayar": pay,
                    "kembalian": change
                }

                showReceiptView(dataReceipt)
            }
        }
    })
    $$("btn_close").show();
    $$("btn_printer").show();
}

function closeReceipt() {
    $$("receipt_transaction").define("template", `<p style="text-align: center">Tidak ada data</p>`);
    $$("receipt_transaction").refresh();
    $$("btn_close").hide();
    $$("btn_printer").hide();
}

function printReceipt(){
    let receiptTemplate = $$("receipt_transaction").$view.innerHTML;
    let printWindow = window.open('', '', 'height=600, width=800');
    printWindow.document.write(`
        <html>
            ${headHtml}
            <body>
                ${headerReceipt}
                ${receiptTemplate}
                ${footerReceipt}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

webix.ready(function(){
    webix.ui({
        rows: [
            // =====> Header <=====
            {
                id: "header",
                view: "toolbar", 
                padding: 10,  
                css: "bg_blue",
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
                        titleHeight: 63,
                        collapsedWidth: 62, 
                        css: "sidebar_custom ",
                        data: menu_data, 
                        on: {onAfterSelect: switchMenu, onMouseMove: function(id) {
                              this.getPopup().hide()
                            }}
                    },
                    // =====> Main Content <=====
                    {
                        borderless: true,
                        type: "space",
                        rows: [
                            // =====> Menu Name & Datetime <===== (belum responsive di width screen 650)
                            {
                                minHeight: 60, 
                                css: "bg_gray",
                                cols: [
                                    {id: "label_menu", view: "label", label: "MENU RIWAYAT TRANSAKSI", css: "custom_header_menu"},
                                    {id:"current_time", template: showDateTime, type: "clean", css: "text_right custom_header_time"}
                                ]
                            },
                            // =====> Content <=====
                            {
                                id: "content",
                                rows: [
                                    {
                                        // =====> Toolbar and Display Receipt
                                        responsive: "content",
                                        minWidth: 800,
                                        cols: [
                                            {
                                                minWidth: 380,
                                                // =====> Toolbar and Data Transaction <=====
                                                rows: [
                                                    // =====> Toolbar <=====
                                                    {
                                                        id: "toolbar_filter",
                                                        view: "toolbar",
                                                        maxHeight: 50,
                                                        paddingX: 10,
                                                        paddingY: 15,
                                                        margin: 15,
                                                        cols: [
                                                            {
                                                                id: "month_filter",
                                                                view: "datepicker",
                                                                align: "right",
                                                                type: "month", 
                                                                format: "%d-%m-%Y",
                                                                label: "Filter Bulan", 
                                                                labelPosition: "top", 
                                                                gravity: 2, 
                                                                editable: true,
                                                                minWidth: 150,
                                                                on: {                                            
                                                                    onChange: function() {filterDataRiwayat(this.getValue())}
                                                                }
                                                            },
                                                            {
                                                                id: "search_input", 
                                                                view:"text", 
                                                                label:"Cari No.Struk", 
                                                                name:"label", 
                                                                labelPosition: "top", 
                                                                gravity: 3,
                                                                minWidth: 150,
                                                                on: {
                                                                    // onTimedKeyPress: function(){searchData(this.getValue())}
                                                                    onEnter: function(){searchData(this.getValue())}
                                                                }
                                                            },
                                                            {gravity: 1}
                                                        ],
                                                    },
                                                    // List Transaction History
                                                    {
                                                        id: "list_transaction",
                                                        view: "list",
                                                        type: {height: 68},
                                                        template: `
                                                        <!--<table style='border-collapse: collapse; border-bottom: 1px solid black'>-->
                                                        <table style='border-collapse: collapse'>
                                                            <tr>
                                                                <td rowspan='2' class='text_tgl_trx'>#day#</td>
                                                                <td>#month_year# | #time#</td>
                                                                <td class='text_right'>Pendapatan</td>
                                                                <td class='text_right'>Laba</td>
                                                                <!--<td rowspan='2'>
                                                                    <span class='mdi mdi-arrow-right-bold' style='font-size: 26px'></span>
                                                                </td>-->
                                                            </tr>
                                                            <tr class='text_bold'>
                                                                <td>No: #no_transaksi#</td>
                                                                <td class='text_right' style='width: 25%'>#revenue#</td>
                                                                <td class='text_right' style='width: 25%'>#profit#</td>
                                                            </tr>
                                                        </table>
                                                        `,
                                                        select: "multiselect",
                                                        data: getDataRiwayat(),
                                                        select: true,
                                                        on:{onItemClick: showReceipt}
                                                    },
                                                    // Display Pendapatan dan Laba Bulanan
                                                    {
                                                        height: 68, 
                                                        cols: [
                                                            {id: "display_revenue", template:"<div class='footer_total_label'>Total Pendapatan</div><div class='footer_total_value'>#month_revenue#</div>"},
                                                            {id: "display_profit", template:"<div class='footer_total_label'>Total Laba</div><div class='footer_total_value'>#month_profit#</div>"}
                                                        ]
                                                    }
                                                ]
                                            },
                                            { view:"resizer" },
                                            {
                                                minWidth: 400,
                                                maxWidth: 800,
                                                id: "detail_layout",
                                                view: "layout",
                                                type: "clean",
                                                rows: [
                                                    {
                                                        id: "toolbar_detail",
                                                        view: "toolbar",
                                                        cols:[
                                                            {id: "title_detail", template: "<h3><b>Detail Transaksi</b></h3><br>", height: 50, gravity: 4, borderless: true,},
                                                            {
                                                                id: "btn_printer", 
                                                                view: "button", 
                                                                type: "icon", 
                                                                icon: "mdi mdi-printer", 
                                                                width: 50, 
                                                                css: "btn_icon", 
                                                                gravity: 2,
                                                                click: printReceipt,
                                                                hidden: true
                                                            },
                                                            {
                                                                id: "btn_close",
                                                                view:"button", 
                                                                type: "icon", 
                                                                icon: "mdi mdi-close", 
                                                                width: 50, 
                                                                class: "btn_icon", 
                                                                gravity: 2,
                                                                click: closeReceipt,
                                                                hidden: true
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        id:"receipt_transaction", 
                                                        maxWidth: 450,
                                                        template: `
                                                            <p style="text-align: center">Tidak ada data</p>
                                                        `, 
                                                        scroll: "y",
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    })

    $$("sidebar_menu").select("riwayat");
    responsiveSidebar();
    webix.message.expire = 1800;
});
