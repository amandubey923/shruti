// One-pass probe: list files in Sarvasar and Ashtavakra folders from BOTH Supabase instances
const { createClient } = require('@supabase/supabase-js');

const instances = [
  { name: 'Primary', url: 'https://uzrikhpzouvsvzwcbgcm.supabase.co', key: 'sb_publishable_UTFYNyQqBYqxwj9r3DxhxA_Oa3gZExb' },
  { name: 'Secondary', url: 'https://bzxbladhnkwrcofagwod.supabase.co', key: 'sb_publishable_CCuDPlORSbV4Sop-iJwjNA_Vm0Upmch' },
];

const folders = [
  'osho/OSHO-Sarvasar_Upanishad',
  'osho/OSHO_Sarvasar_Upanishad',
  'osho/OSHO-Sarvasar Upanishad',
  'osho/OSHO_ashtavakra-geeta',
  'osho/OSHO-Ashtavakra_Geeta',
  'osho/OSHO-ashtavakra-geeta',
];

async function probe() {
  for (const inst of instances) {
    const client = createClient(inst.url, inst.key);
    console.log(`\n=== ${inst.name} (${inst.url}) ===`);
    for (const folder of folders) {
      const { data, error } = await client.storage.from('audio').list(folder, { limit: 100 });
      if (!error && data && data.length > 0) {
        const files = data.filter(f => !f.id?.includes('placeholder'));
        if (files.length > 0) {
          console.log(`FOUND [${folder}]: ${files.map(f => f.name).join(', ')}`);
        }
      }
    }
    // Also list top-level osho to see all folders
    const { data: top } = await client.storage.from('audio').list('osho', { limit: 100 });
    if (top) {
      console.log(`osho/ folders: ${top.map(f => f.name).join(' | ')}`);
    }
  }
}

probe().catch(console.error);
