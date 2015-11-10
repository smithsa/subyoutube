""" server.py """
from flask import Flask, render_template, request, jsonify
from srtFileGenerator import SrtFileCreator 
import datetime 
import json

app = Flask(__name__, static_url_path='')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/_exportsrtfile', methods=['GET', 'POST'])
def exportSRTFile():
	filename = request.args['filename']
	subtitles_string = request.args['subtitles']
	download_directory = 'static/downloads/subtitles/'
	response = createSRTFile(filename, subtitles_string, download_directory)
	return response
	
@app.route('/_previewsrtfile',  methods=['GET', 'POST'])
def create_preview_srt_file():
	filename = request.args['filename']
	print filename
	subtitles_string = request.args['subtitles']
	download_directory = 'static/downloads/previews/'
	response = createSRTFile(filename, subtitles_string, download_directory)
	return response
	

def createSRTFile(filename, subtitles_string, download_directory):
	status = 'Success'
	try:
		subtitles_dic = json.loads(subtitles_string)
		subtitleCreatorObject = SrtFileCreator(download_directory+filename)
		for key in sorted(subtitles_dic):
			subtitle = subtitles_dic[key]
			content = subtitle['content']
			start_time = str(datetime.timedelta(seconds=int(subtitle['start_time'])))
			end_time = str(datetime.timedelta(seconds=int(subtitle['end_time'])))
			subtitleCreatorObject.addSubtitle(start_time, end_time, [content])
		subtitleCreatorObject.createSRTFile()
	except Exception,e:
		status = 'Fail'
		print str(e)
	return jsonify(status=status)
	
if __name__ == '__main__':
	app.debug = True
	app.run(port=8000)

