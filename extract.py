try:
    import Image
except ImportError:
    from PIL import Image
import pytesseract

def p(s):
    print pytesseract.image_to_string(Image.open("{}".format(s)))

p("pics/applebees.jpg")
