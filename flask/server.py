"""
Server Flask avec react
"""
import os

import urllib.parse

from flask import Flask, jsonify, render_template
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

app = Flask(__name__)
CORS(app, origins="http://localhost:3000")


@app.route("/getDatabase", methods=["GET"])
def get_database():  # pylint: disable=missing-function-docstring
    with psycopg.connect(CONN_PARAMS) as conn:  # pylint: disable=not-context-manager
        with conn.cursor() as cur:
            cur.execute("select * from data;")
            return jsonify(cur.fetchall())


@app.route("/")
def index():  # pylint: disable=missing-function-docstring
    return render_template("index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
