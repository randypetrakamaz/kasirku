from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient

app = Flask(__name__)

client = MongoClient('mongodb+srv://randy:randy2201@kasir.vu8ttwz.mongodb.net/')
db = client['db_pos']
collection_barang = db['products']
collection_riwayat = db['transactions']


@app.route("/")
def index():
    return render_template('index.html')

@app.route("/riwayat")
def riwayat_transaksi():
    return render_template('riwayat.html')

@app.route("/barang")
def barang():
    return render_template('barang.html')

@app.route('/get-barang', methods=['GET'])
def get_barang():
    try: 
        data = collection_barang.find()
        result = []

        for item in data:
            result.append({
                'kode_barang': item['kode_barang'],
                'nama': item['nama'],
                'harga_beli': item['harga_beli'],
                'harga_jual': item['harga_jual'],
                'stok': item['stok']
            })
        return jsonify({'data': result})
    except Exception as e:
        print(jsonify({'status': 'error', 'message': str(e)}))
        return jsonify({'status': 'error', 'message': 'Data tidak tersedia'})

@app.route('/barang/tambah-barang',  methods=['POST'])
def tambah_barang():
    try:
        kode_barang = request.form['kode_barang']
        existing_data = collection_barang.find_one({'kode_barang': kode_barang})
        if existing_data:
            return jsonify({'status': 'error', 'message': 'Kode barang sudah digunakan'})

        new_data = {
            'kode_barang': request.form['kode_barang'],
            'nama': request.form['nama'],
            'harga_beli': int(request.form['harga_beli']),
            'harga_jual': int(request.form['harga_jual']),
            'stok': int(request.form['stok'])
        }
       
        collection_barang.insert_one(new_data)
        return jsonify({'status': 'success', 'message': 'Data barang berhasil ditambahkan'})
    except Exception as e:
        print({'status': 'error', 'message': str(e)})
        return jsonify({'status': 'error', 'message': 'Gagal menambahkan data barang'})
    
@app.route('/barang/ubah-barang', methods=['POST'])
def ubah_barang():
    try:
        kode_barang = request.form['kode_barang']
        updated_data = {
            'nama': request.form['nama'],
            'harga_beli': int(request.form['harga_beli']),
            'harga_jual': int(request.form['harga_jual']),
            'stok': int(request.form['stok'])
        }
       
        # Lakukan pembaruan data berdasarkan kode_barang
        result = collection_barang.update_one({'kode_barang': kode_barang}, {'$set': updated_data})
        
        if result.modified_count > 0:
            return jsonify({'status': 'success', 'message': 'Data barang berhasil diubah'})
        else:
            return jsonify({'status': 'error', 'message': 'Data dengan kode barang tersebut tidak ditemukan'})

    except Exception as e:
        print({'status': 'error', 'message': str(e)})
        return jsonify({'status': 'error', 'message': 'Gagal mengubah data barang'})

@app.route('/barang/hapus-barang', methods=['POST'])
def hapus_barang():
    try:
        kode_barang = request.form['kode_barang']  
        collection_barang.delete_one({'kode_barang': kode_barang})
        return jsonify({'status': 'success', 'message': 'Data barang berhasil dihapus'})
    except Exception as e:
        print({'status': 'error', 'message': str(e)})
        return jsonify({'status': 'error', 'message': 'Gagal menghapus data barang'})

# ============== Riwayat Transaksi =================
@app.route('/riwayat/get-riwayat', methods=['GET'])
def get_riwayat_transaksi():
    try: 
        datas = collection_riwayat.find()
        result = []
        
        for data in datas:
            data_item = []

            for item in data['items']:
                data_item.append({
                    'nama_barang': item['nama_barang'], 
                    'jumlah': item['jumlah'], 
                    'harga_beli': item['harga_beli'],
                    'harga': item['harga']
                })

            result.append({
                'no_transaksi': data['no_transaksi'],
                'tanggal': data['tanggal'],
                'items': data_item,
                'total': data['total'],
                'bayar': data['bayar'],
                'kembalian': data['kembalian'],
            })
        
        return jsonify({'data': result})
    except Exception as e:
        print({'status': 'error', 'message': str(e)})
        return jsonify({'status': 'error', 'message': 'Data riwayat transaksi tidak tersedia'})

@app.route('/tambah-riwayat',  methods=['POST'])
def tambah_riwayat():
    try:
        data = request.json
        items = data['items']
        
        for item in items:
            barang = collection_barang.find_one({'kode_barang': item['kode_barang']})
            if barang:
                harga_beli = barang['harga_beli']
                item['harga_beli'] = harga_beli
                # Kurangi stok barang
                collection_barang.update_one(
                    {'kode_barang': item['kode_barang']},
                    {'$inc': {'stok': -item['jumlah']}}  # Kurangi stok sebanyak jumlah transaksi
                )
                
                del item['kode_barang']
            else:
                return jsonify({'status': 'error', 'message': 'Data Barang tidak ditemukan'})

        new_data_transaksi = {
            'no_transaksi': data['no_transaksi'],
            'tanggal': data['tanggal'],
            'items': data['items'],
            'total': data['total'],
            'bayar': data['bayar'],
            'kembalian': data['kembalian']
        }
       
        collection_riwayat.insert_one(new_data_transaksi)
        return jsonify({'status': 'success', 'message': 'Transaksi berhasil'})
    except Exception as e:
        print(jsonify({'status': 'error', 'message': str(e)}))
        return jsonify({'status': 'error', 'message': 'Gagal melakukan transaksi, silahkan coba lagi!'})


# if __name__ == "__main__":
#     app.run(host="127.0.0.1", port=5000, debug=True)