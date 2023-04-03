"""
Server Flask avec react
"""
import os

import urllib.parse

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from dotenv import dotenv_values
import psycopg

os.chdir(os.path.dirname(__file__))

if os.path.exists(".env"):
    config = dotenv_values(".env")
else:
    config = dotenv_values("default.env")

FILENAME_DB_SHEMA = "data.sql"
options = urllib.parse.quote_plus("--search_path=modern,public")
CONN_PARAMS = f"postgresql://{config['USER']}:{config['PASSWORD']}@{config['HOST']}:{config['PORT']}/{config['DATABASE']}?options={options}"  # pylint: disable=line-too-long


with psycopg.connect(CONN_PARAMS) as conn:  # pylint: disable=not-context-manager
    with conn.cursor() as cur:
        with open(FILENAME_DB_SHEMA, "r", encoding="utf-8") as file:
            cur.execute(file.read())

app = Flask(__name__, static_folder="./build")
CORS(app, origins="http://localhost:3000")


@app.route("/test", methods=["GET"])
def test():  # pylint: disable=missing-function-docstring
    return jsonify({"test": "test"})


@app.route("/getDatabase", methods=["GET"])
def get_database():  # pylint: disable=missing-function-docstring
    with psycopg.connect(CONN_PARAMS) as conn:  # pylint: disable=not-context-manager
        with conn.cursor() as cur:
            cur.execute("select * from data_carte;")
            return jsonify(cur.fetchall())


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def index(path):  # pylint: disable=missing-function-docstring
    if path != "" and os.path.exists(app.static_folder + "/" + path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
