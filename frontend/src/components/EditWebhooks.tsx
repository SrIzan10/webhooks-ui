import TextField from '@mui/material/TextField';
import './EditWebhooks.css'
import Autocomplete from '@mui/material/Autocomplete';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CreateWebhookPostData } from '../types.ts';
import Button from '@mui/material/Button';

function EditWebhooks() {
  const [webhooks, setWebhooks] = useState<string[]>([])
  const [currentSelectValue, setCurrentSelectValue] = useState<string | null>(null)

  const [webhookName, setWebhookName] = useState('')
  const [command, setCommand] = useState('')
  const [authType, setAuthType] = useState('')
  const [password, setPassword] = useState('')

  /* eslint-disable @typescript-eslint/no-unused-vars */
  // too lazy to modify code to delete these variables (gonna be a little bit slower but oh well who cares)
  const [changedWebhookName, setChangedWebhookName] = useState('')
  const [changedCommand, setChangedCommand] = useState('')
  const [changedAuthType, setChangedAuthType] = useState('')
  const [changedPassword, setChangedPassword] = useState('')
  /* eslint-enable @typescript-eslint/no-unused-vars */

  useEffect(() => {
    fetch(`${import.meta.env.VITE_WH_SERVER_PROTOCOL}://${import.meta.env.VITE_WH_SERVER}/api/editWebhooksList`, { headers: { Authorization: import.meta.env.VITE_WHAPI_TOKEN } })
      .then((res) => res.json())
      .then((data) => {
        setWebhooks(data);
      })
      .catch((err) => {
        console.log(err.message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    switch (id) {
      case 'route':
        setWebhookName(value);
        break;
      case 'command':
        setCommand(value);
        break;
      case 'authType':
        setAuthType(value);
        break;
      case 'password':
        setPassword(value);
        break;
      default:
        break;
    }
  };

  const editWebhook = async () => {
    const postData = {
      unchangedWebhookName: webhookName,
      webhookName: changedWebhookName || webhookName,
      authType: changedAuthType || authType,
      pass: changedPassword || password,
      command: changedCommand || command,
    }
    const request = await axios.post(`${import.meta.env.VITE_WH_SERVER_PROTOCOL}://${import.meta.env.VITE_WH_SERVER}/api/editWebhook`, postData, { headers: { Authorization: import.meta.env.VITE_WHAPI_TOKEN } })
    console.log(request.data)
  }

  const setTextBoxes = async () => {
    if (currentSelectValue) {
      const request = await axios.get(`${import.meta.env.VITE_WH_SERVER_PROTOCOL}://${import.meta.env.VITE_WH_SERVER}/api/getWebhookInfo/${currentSelectValue}`, { headers: { Authorization: import.meta.env.VITE_WHAPI_TOKEN } })
      const data = request.data as CreateWebhookPostData
      setWebhookName(data.webhookName)
      setCommand(data.command)
      setAuthType(data.authType)
      setPassword(data.pass)
      console.log(command)
    }
  }

  useEffect(() => {
    setTextBoxes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSelectValue]);

  const buttonDisabled = () => {
    if (!currentSelectValue) return true
    else return false
  }

  return (
    <div className='container'>
      <Autocomplete
        disablePortal
        fullWidth
        id="combo-box-demo"
        options={webhooks}
        renderInput={(params) => <TextField {...params} label="Choose webhook" />}
        onChange={async (_event, newValue: string | null) => {
          setCurrentSelectValue(newValue);
        }}
        loading={webhooks.length === 0}
        sx={{ marginBottom: '10px' }}
      />
      <TextField
        id="route"
        label="Route"
        value={webhookName}
        onChange={handleChange}
        fullWidth
        InputProps={{
          readOnly: true,
        }}
        sx={{ marginBottom: '10px' }}
      />
      <TextField
        id="command"
        label="Command"
        value={command}
        onChange={handleChange}
        fullWidth
        sx={{ marginBottom: '10px' }}
      />
      <TextField
        id="authType"
        label="Auth Type (github or auth-header)"
        value={authType}
        onChange={handleChange}
        fullWidth
        sx={{ marginBottom: '10px' }}
      />
      <TextField
        id="password"
        label="Password"
        value={password}
        onChange={handleChange}
        fullWidth
        sx={{ marginBottom: '10px' }}
      />
      <Button variant="contained" disabled={buttonDisabled()} sx={{ float: 'right' }} onClick={editWebhook}>Submit</Button>
    </div>
  );
}

export default EditWebhooks;
