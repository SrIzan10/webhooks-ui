import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import copyToClipboard from '../util/copyToClipboard.ts';
import { CreateWebhookPostData } from '../types.ts';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  height: 300,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function CreateWebhookRequestCompletionModal(props: Props) {
  const [open, setOpen] = React.useState(true);
  const handleClose = () => setOpen(false);

  const [openCopiedSnackbar, setOpenCopiedSnackbar] = React.useState(false);

  const handleOpenSnackbar = () => {
    setOpenCopiedSnackbar(true);
  };

  const handleCloseSnackbar = (_event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenCopiedSnackbar(false);
  };
  const snackbarAction = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  const whRoute = `${import.meta.env.VITE_WH_SERVER_PROTOCOL}://${import.meta.env.VITE_WH_SERVER}/hooks/${props.postData.webhookName}`

  const showInfoOrNot = () => {
    if (props.requestSuccess) {
      return (
        <div>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
              The webhook was created successfully!
          </Typography>
          <TextField
            id="route"
            label="Route"
            defaultValue={whRoute}
            InputProps={{
              readOnly: true,
            }}
            fullWidth
            onClick={async () => {
              await copyToClipboard(whRoute)
              handleOpenSnackbar()
            }}
            sx={{ marginBottom: '10px' }}
          />
          <TextField
            id="token"
            label={`Token (add in ${props.postData.authType === 'github' ? 'webhook secret input box on github webhooks page' : 'Authorization header, for example: Authorization: insert token here'})`}
            type='password'
            defaultValue={props.postData.pass}
            InputProps={{
              readOnly: true,
            }}
            fullWidth
            onClick={async () => {
              await copyToClipboard(props.postData.pass)
              handleOpenSnackbar()
            }}
            sx={{ marginBottom: '10px' }}
          />
          <TextField
            id="command"
            label="Command to execute"
            defaultValue={props.postData.command}
            InputProps={{
              readOnly: true,
            }}
            fullWidth
            onClick={async () => {
              await copyToClipboard(props.postData.command)
              handleOpenSnackbar()
            }}
            sx={{ marginBottom: '10px' }}
          />
        </div>
      )
    } else {
      return (
        <div>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
            Something went wrong while creating the webhook
          </Typography>
          <Typography id="modal-modal-description" variant="h6" component="h6" sx={{ marginBottom: '20px' }}>
            {props.errorMsg}
          </Typography>
        </div>
      )
    }
  }
  

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {showInfoOrNot()}
        </Box>
      </Modal>
      <Snackbar
        open={openCopiedSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Copied to clipboard!"
        action={snackbarAction}
      />
    </div>
  );
}

interface PropSuccess {
  postData: CreateWebhookPostData, requestSuccess: false,
  errorMsg: string
}
interface PropFail {
  postData: CreateWebhookPostData, requestSuccess: true,
  errorMsg?: undefined
}
type Props = 
    | PropSuccess
    | PropFail