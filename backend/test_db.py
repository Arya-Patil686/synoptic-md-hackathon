import pymongo
import certifi # <-- ADD THIS IMPORT
from pymongo.server_api import ServerApi

uri = "mongodb+srv://synoptic_user:0kdLAuCtYdFLR028@synopticmdcluster.270svz8.mongodb.net/?retryWrites=true&w=majority&appName=SynopticMDCluster"

ca = certifi.where() # <-- GET THE PATH TO THE NEW "BADGE BOOK"

client = pymongo.MongoClient(uri, tlsCAFile=ca, server_api=ServerApi('1')) # <-- ADD tlsCAFile=ca

try:
    client.admin.command('ping')
    print("\n✅ Ping successful! You are successfully connected to MongoDB Atlas.\n")
except Exception as e:
    print("\n--- CONNECTION FAILED ---")
    print(e)