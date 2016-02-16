try:
    import Image
except ImportError:
    from PIL import Image, ImageFilter
import pytesseract
from StringIO import StringIO

# def p(s):
#     img = Image.open(s).transpose(Image.FLIP_LEFT_RIGHT)
#     img.show()
#     print pytesseract.image_to_string(Image.open("{}".format(s)))
# 
# p("./pics/applebees.jpg")

url = './pics/dunkin2.jpg'
# image = Image.open(url).transpose(Image.FLIP_LEFT_RIGHT)
image = Image.open(url)
image.filter(ImageFilter.SHARPEN)
print pytesseract.image_to_string(image)