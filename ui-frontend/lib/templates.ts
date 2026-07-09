/**
 * Helper to generate 50 rows of data in different export formats for testing.
 */

export interface ExportTemplate {
  name: string;
  filename: string;
  csvContent: string;
  description: string;
}

// 1. Facebook Lead ads export format
const generateFacebookTemplate = (): string => {
  const headers = 'id,created_time,ad_id,ad_name,adset_name,campaign_name,form_id,form_name,is_organic,platform,full_name,email,phone_number,company_name,city\n';
  let rows = '';
  const names = [
    'Aarav Sharma', 'Aditya Verma', 'Vivaan Kapoor', 'Siddharth Roy', 'Vihaan Singhal',
    'Arjun Mehta', 'Sai Kumar', 'Reyansh Gupta', 'Krishna Murthy', 'Aaditya Rao',
    'Ishaan Bhatia', 'Shaurya Sen', 'Atharv Joshi', 'Kabir Bose', 'Aaryan Das',
    'Ananya Pandey', 'Diya Patel', 'Kiara Sen', 'Meera Nair', 'Ira Dubey',
    'Tara Swamy', 'Riya Chatterjee', 'Aanya Banerjee', 'Neha Deshmukh', 'Pari Sawant',
    'Rahul Dravid', 'Sourav Ganguly', 'Anil Kumble', 'Zaheer Khan', 'Gautam Gambhir',
    'Harbhajan Singh', 'VVS Laxman', 'Yuvraj Singh', 'Mahendra Dhoni', 'Virat Kohli',
    'Rohit Sharma', 'Shikhar Dhawan', 'Ravindra Jadeja', 'Ravichandran Ashwin', 'Ajinkya Rahane',
    'Cheteshwar Pujara', 'Jasprit Bumrah', 'Mohammed Shami', 'Bhuvneshwar Kumar', 'Hardik Pandya',
    'Rishabh Pant', 'Yuzvendra Chahal', 'Kuldeep Yadav', 'Shreyas Iyer', 'Kedar Jadhav'
  ];

  for (let i = 1; i <= 50; i++) {
    const name = names[i - 1];
    const email = `${name.toLowerCase().replace(' ', '.')}@gmail.com`;
    const basePhone = 9876500000 + i;
    const phone = i % 5 === 0 ? `+91 ${basePhone}` : `${basePhone}`;
    const date = `2026-07-09T10:${i < 10 ? '0' + i : i}:00Z`;
    const adName = `LeadGen_Form_EdenPark_i${i}`;
    const campaignName = i % 2 === 0 ? 'Eden Park Launch' : 'Meridian Towers Pre-book';
    const company = i % 3 === 0 ? 'Tech Solutions' : i % 3 === 1 ? 'Startup Inc' : '';
    const city = i % 4 === 0 ? 'Mumbai' : i % 4 === 1 ? 'Bangalore' : i % 4 === 2 ? 'Pune' : 'Delhi';
    
    // Simulate some missing fields (e.g. invalid records) to test validator
    const finalPhone = i === 10 || i === 25 ? '' : phone;
    const finalEmail = i === 25 || i === 40 ? '' : email;

    rows += `${1000 + i},${date},ad_${5000 + i},${adName},adset_${6000 + i},${campaignName},form_${7000 + i},Form_v1,false,fb,${name},${finalEmail},${finalPhone},${company},${city}\n`;
  }
  return headers + rows;
};

// 2. Google Ads Export format
const generateGoogleTemplate = (): string => {
  const headers = 'Lead ID,Click ID,Ad Network,Campaign ID,Campaign Name,Form Name,Created Date,User Name,User Email,User Phone,Business Name,City Name\n';
  let rows = '';
  const names = [
    'Emma Watson', 'Liam Neeson', 'Noah Centineo', 'Oliver Twist', 'Elijah Wood',
    'James Bond', 'William Shakespeare', 'Benjamin Franklin', 'Lucas Black', 'Henry Cavill',
    'Alexander Cooper', 'Mia Khalifa', 'Harper Lee', 'Evelyn Waugh', 'Abigail Williams',
    'Emily Bronte', 'Elizabeth Bennett', 'Sofia Vergara', 'Avery Jackson', 'Ella Fitzgerald',
    'Madison Beer', 'Scarlett Johansson', 'Victoria Beckham', 'Grace Kelly', 'Chloe Moretz',
    'Daniel Craig', 'Christian Bale', 'Heath Ledger', 'Gary Oldman', 'Morgan Freeman',
    'Tom Hanks', 'Brad Pitt', 'Leonardo DiCaprio', 'Johnny Depp', 'Will Smith',
    'Matt Damon', 'Ben Affleck', 'Robert Downey', 'Chris Evans', 'Chris Hemsworth',
    'Mark Ruffalo', 'Scarlett Hunter', 'Jeremy Renner', 'Paul Rudd', 'Brie Larson',
    'Chadwick Boseman', 'Tom Holland', 'Benedict Cumberbatch', 'Elizabeth Olsen', 'Paul Bettany'
  ];

  for (let i = 1; i <= 50; i++) {
    const name = names[i - 1];
    const email = `${name.toLowerCase().replace(' ', '.')}@techcorp.com`;
    const phone = `+1 202 555 01${i < 10 ? '0' + i : i}`;
    const date = `2026-07-08 12:${i < 10 ? '0' + i : i}:30`;
    const campaign = i % 2 === 0 ? 'Search_Brand_SarjapurPlots' : 'GDN_RealEstate_VarahSwamy';
    const business = i % 3 === 0 ? 'Enterprise Ltd' : '';
    const city = i % 4 === 0 ? 'Seattle' : i % 4 === 1 ? 'New York' : i % 4 === 2 ? 'Boston' : 'Chicago';

    // Simulate empty data rows
    const finalPhone = i === 15 || i === 35 ? '' : phone;
    const finalEmail = i === 35 || i === 45 ? '' : email;

    rows += `g_${2000 + i},click_${8000 + i},Google Search,camp_${9000 + i},${campaign},Google_Form_Lead,${date},${name},${finalEmail},${finalPhone},${business},${city}\n`;
  }
  return headers + rows;
};

// 3. Excel Sheet / Manually Created Spreadsheet
const generateExcelTemplate = (): string => {
  const headers = 'Customer,E-mail,Phone No.,Notes,Property Interested,Date Added,Lead Owner\n';
  let rows = '';
  const names = [
    'Anil Kumar', 'Sunita Patil', 'Rajesh Joshi', 'Kavita Nair', 'Sanjay Gupta',
    'Deepak Verma', 'Meenakshi Iyer', 'Pankaj Sharma', 'Preeti Desai', 'Rakesh Singh',
    'Swati Rao', 'Arvind Kejriwal', 'Narendra Modi', 'Rahul Gandhi', 'Mamata Banerjee',
    'Nitish Kumar', 'Akhilesh Yadav', 'Mayawati Devi', 'Uddhav Thackeray', 'Sharad Pawar',
    'Devendra Fadnavis', 'Eknath Shinde', 'MK Stalin', 'Pinarayi Vijayan', 'Arvind Subramanian',
    'Raghuram Rajan', 'Amartya Sen', 'Abhijit Banerjee', 'Kailash Satyarthi', 'Harish Salve',
    'Prannoy Roy', 'Rajat Sharma', 'Arnab Goswami', 'Sudhir Chaudhary', 'Ravish Kumar',
    'Barkha Dutt', 'Rajdeep Sardesai', 'Sagarika Ghose', 'Shereen Bhan', 'Palki Sharma',
    'Faye D Souza', 'Nidhi Razdan', 'Shekhar Gupta', 'Madhu Trehan', 'Siddharth Varadarajan',
    'Karan Thapar', 'Prabhu Chawla', 'Vir Sanghvi', 'Bobby Ghosh', 'Manu Joseph'
  ];

  for (let i = 1; i <= 50; i++) {
    const name = names[i - 1];
    const email = `${name.toLowerCase().replace(' ', '.')}@yahoo.co.in`;
    const phone = `099456789${i < 10 ? '0' + i : i}`;
    const date = `07/${i < 10 ? '0' + i : i}/2026`;
    const property = i % 3 === 0 ? 'eden_park' : i % 3 === 1 ? 'meridian_tower' : 'varah_swamy';
    const notes = `Wants ${i % 2 === 0 ? '3BHK' : '2BHK'} villa, calling back next Monday.`;
    const owner = 'sales@groweasy.ai';

    // Simulate empty data rows
    const finalPhone = i === 12 || i === 48 ? '' : phone;
    const finalEmail = i === 48 || i === 50 ? '' : email;

    rows += `${name},${finalEmail},${finalPhone},"${notes}",${property},${date},${owner}\n`;
  }
  return headers + rows;
};

// 4. Real Estate CRM export format
const generateCrmTemplate = (): string => {
  const headers = 'Lead_ID,Record_Created,First_And_Last_Name,Email_Address,Mobile,Source,Status_Label,Agent_Comments,Project_Name\n';
  let rows = '';
  const names = [
    'Tony Stark', 'Steve Rogers', 'Bruce Banner', 'Thor Odinson', 'Natasha Romanoff',
    'Clint Barton', 'Nick Fury', 'Phil Coulson', 'Maria Hill', 'Loki Laufeyson',
    'Wanda Maximoff', 'Pietro Maximoff', 'Vision', 'Sam Wilson', 'Bucky Barnes',
    'James Rhodes', 'Peter Parker', 'Stephen Strange', 'T Challa', 'Scott Lang',
    'Hope van Dyne', 'Carol Danvers', 'Nick Fury Jr', 'Maria Rambeau', 'Monica Rambeau',
    'Kamala Khan', 'Marc Spector', 'Steven Grant', 'Layla El Faouly', 'Arthur Harrow',
    'Jennifer Walters', 'Matt Murdock', 'Foggy Nelson', 'Karen Page', 'Wilson Fisk',
    'Bullseye', 'Elektra Natchios', 'Frank Castle', 'Luke Cage', 'Danny Rand',
    'Colleen Wing', 'Misty Knight', 'Jessica Jones', 'Trish Walker', 'Jeri Hogarth',
    'Kilgrave', 'Will Simpson', 'Malcolm Ducasse', 'Oscar Arocho', 'Dorothy Walker'
  ];

  for (let i = 1; i <= 50; i++) {
    const name = names[i - 1];
    const email = `${name.toLowerCase().replace(' ', '.')}@starkindustries.com`;
    const phone = `+9199001122${i < 10 ? '0' + i : i}`;
    const date = `2026-07-0${i % 9 + 1} 10:30:15`;
    const source = i % 2 === 0 ? 'meridian_tower' : 'eden_park';
    const status = i % 4 === 0 ? 'converted' : i % 4 === 1 ? 'no answer' : i % 4 === 2 ? 'busy' : 'interested';
    const comments = `Customer is looking for possession time in ${2026 + (i % 3)} - verify pricing.`;
    const project = i % 2 === 0 ? 'Meridian Tower' : 'Eden Park';

    // Simulate empty data rows
    const finalPhone = i === 8 || i === 22 ? '' : phone;
    const finalEmail = i === 22 || i === 33 ? '' : email;

    rows += `crm_${3000 + i},${date},${name},${finalEmail},${finalPhone},${source},${status},"${comments}",${project}\n`;
  }
  return headers + rows;
};

export const TEMPLATES: ExportTemplate[] = [
  {
    name: 'Facebook Lead Ads Export',
    filename: 'facebook-lead-export-50-rows.csv',
    csvContent: generateFacebookTemplate(),
    description: 'Contains typical columns generated by Facebook Lead Ads forms (e.g. ad_id, created_time, platform, full_name, email).',
  },
  {
    name: 'Google Ads Form Export',
    filename: 'google-ads-export-50-rows.csv',
    csvContent: generateGoogleTemplate(),
    description: 'Simulates the lead structure exported directly from Google Ads Lead Form assets.',
  },
  {
    name: 'Excel / Manual Sheet',
    filename: 'excel-manual-sheet-50-rows.csv',
    csvContent: generateExcelTemplate(),
    description: 'Representative of a manually updated sales sheet with colloquial headings like "Customer", "Phone No.", and inline Notes.',
  },
  {
    name: 'Real Estate CRM Export',
    filename: 'real-estate-crm-export-50-rows.csv',
    csvContent: generateCrmTemplate(),
    description: 'Mimics column names and lead data shapes exported from third-party Real Estate lead brokers or CRMs.',
  },
];
