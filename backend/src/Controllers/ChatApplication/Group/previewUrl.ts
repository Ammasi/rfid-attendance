import express from 'express';
import * as cheerio from "cheerio";
import { Request,Response } from 'express';
import axios from 'axios';

const previewroute=express.Router();
// chat other website link preview
previewroute.get('/proxy', async(req:Request, res:Response):Promise<any>=>{
    const url=req.query.url as string;
    
    if(!url){
      return res.status(400).json({message:"Url required"});  
    }

    try {
        const response=await axios.get(url as string,{
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              },
              timeout: 10000,
        });
        

        const $ = cheerio.load(response.data);

        const metadata = {
            title: $('meta[property="og:title"]').attr('content') || $('title').text(),
            description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '',
            image: $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || '',
            url: url
          };
          res.json(metadata);
          

    } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Failed to fetch URL content" });
    }
});
export default previewroute;