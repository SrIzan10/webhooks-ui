import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { CreateWebhookPostData } from '../types.ts';

function ListWebhooks() {
  const columns: GridColDef[] = [
    { field: 'route', headerName: 'Route', width: 90, },
    {
      field: 'authType',
      headerName: 'Auth type',
      width: 150,
    },
    {
      field: 'pass',
      headerName: 'Password',
      width: 60,
    },
    {
      field: 'command',
      headerName: 'Command',
      width: 300,
    }
  ];

  const [rows, setRows] = useState<CreateWebhookPostDataColumnArray[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_WH_SERVER_PROTOCOL}://${import.meta.env.VITE_WH_SERVER}/api/listWebhooks`, { headers: { Authorization: import.meta.env.VITE_WHAPI_TOKEN } })
        .then(response => response.json())
        .then(data => {
          const routes: CreateWebhookPostDataColumnArray[] = []
          data.forEach((webhook: CreateWebhookPostData) => {
            routes.push({
              route: webhook.webhookName,
              authType: webhook.authType,
              pass: webhook.pass,
              command: webhook.command,
            })
          });
          setRows(routes)
        });
  }, [])

  return (
    <div>
      <Box sx={{ height: '50%', width: '602px', top: 0, bottom: 0, left: 0, right: 0, position: 'absolute', margin: 'auto' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
          getRowId={(row) => row.route}
        />
      </Box>
    </div>
  );
}

export default ListWebhooks;

interface CreateWebhookPostDataColumnArray {
  route: string
  authType: string
  pass: string
  command: string
}
