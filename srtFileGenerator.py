## Will need to test this file
## In addition will need to add sanity checks and type checks
class SrtFileCreator():
	""" Constructs an SRT FILE. File name needed upon declaration of object """
	def __init__(self, srt_file_name):
		self.subtitle_count = 0
		self.srt_file_name = srt_file_name
		self.srt_file_contents = []

	def addSubtitle(self, start_time_code, end_time_code, subtitle_text):
		""" Adds a subtitle that will eventually be in the SRT FILE
			@param a start time(string), a end time(string), the subtitle text that will be added (list whose max length is two) """
		self.subtitle_count+=1
		subtitle_data = {"subtitle_count": self.subtitle_count, "start_time_code":start_time_code, "end_time_code":end_time_code, "subtitle_text":subtitle_text}
		self.srt_file_contents.append(subtitle_data)

	def compileSRTFileContents(self):
		""" Compiles the contents of the SRT file in the correct format
		    @return a string which is the contents of the SRT file """
		srt_file_as_string = ""
		for subtitle in self.srt_file_contents:
			srt_file_as_string += str(subtitle["subtitle_count"])
			srt_file_as_string += "\n"
			srt_file_as_string += subtitle["start_time_code"]
			srt_file_as_string += " --> "
			srt_file_as_string += subtitle["end_time_code"]
			srt_file_as_string += "\n"
			for subtitle_text in subtitle["subtitle_text"]:
				srt_file_as_string += subtitle_text
				srt_file_as_string += "\n"
			srt_file_as_string += "\n"

		return srt_file_as_string

	def createSRTFile(self):
		""" Creates an srt file based on the information (file name and srt file content) the object holds
			@return True value upon success, False value otherwise"""
		try:
			file_extension = ".srt"
			srt_file_as_string = self.compileSRTFileContents()
			srt_file = open(self.srt_file_name+file_extension,"w") 
			srt_file.write(srt_file_as_string) 
			srt_file.close()
			return True
		except:
			return False

def main():
	srt_file = SrtFileCreator("Justin Bieber Subtitle")
	srt_file.addSubtitle("00:01:02.000", "00:01:04.000", ["Sade is pretty awesome I think"])
	srt_file.addSubtitle("00:01:05.000", "00:01:06.000", ["Sade is pretty awesome I actually know so", "she is a boss"])
	results = srt_file.compileSRTFileContents()
	print  results

if __name__ == '__main__':
	main()

