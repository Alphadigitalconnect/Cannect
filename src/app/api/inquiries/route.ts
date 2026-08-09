import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the path to store inquiries locally in development
const DATA_DIR = path.join(process.cwd(), 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Read existing inquiries if file exists
    let inquiries = [];
    if (fs.existsSync(INQUIRIES_FILE)) {
      const fileData = fs.readFileSync(INQUIRIES_FILE, 'utf-8');
      if (fileData) {
        inquiries = JSON.parse(fileData);
      }
    }

    // Append new inquiry with a timestamp
    const newInquiry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...data
    };
    inquiries.push(newInquiry);

    // Save back to file
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
    
    // Also log to the server console for immediate visibility
    console.log('--- NEW GO DIGITAL INQUIRY RECEIVED ---');
    console.log(newInquiry);
    console.log('---------------------------------------');

    return NextResponse.json({ success: true, message: 'Inquiry received successfully.' });
  } catch (error) {
    console.error('Failed to process inquiry:', error);
    return NextResponse.json({ success: false, message: 'Failed to process inquiry.' }, { status: 500 });
  }
}
