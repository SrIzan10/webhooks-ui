import React from "react";
import "./CreateWebhook.css";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import axios, { AxiosError } from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { green } from "@mui/material/colors";
import { CreateWebhookPostData } from "../types.ts";
import CreateWebhookRequestCompletionModal from "./CreateWebhookRequestCompletionModal.tsx";

function CreateWebhook() {
  const [webhookName, setWebhookName] = React.useState("");
  const [authType, setAuthType] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [command, setCommand] = React.useState("");

  const [loading, setLoading] = React.useState(false);

  const formValid = () => {
    if (webhookName !== "" && authType !== "" && pass !== "" && command !== "") {
      return true;
    } else {
      return false;
    }
  };

  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [showErrorModal, setShowErrorModal] = React.useState(false);
  const [postData, setPostData] = React.useState<CreateWebhookPostData>()
  const [errorMessage, setErrorMessage] = React.useState('')

  const handleSubmit = () => {
    setLoading(true);
    const data: CreateWebhookPostData = {
      webhookName: webhookName,
      authType: authType,
      pass: pass,
      command: command,
    };
    setPostData(data)
    axios
      .post(
        `${import.meta.env.VITE_WH_SERVER_PROTOCOL}://${import.meta.env.VITE_WH_SERVER}/api/createWebhook`,
        data,
        { headers: { Authorization: import.meta.env.VITE_WHAPI_TOKEN } }
      )
      .then(() => {
        setLoading(false)
        setShowSuccessModal(true)
      })
      .catch((error: AxiosError) => {
        const errorResponseData = (error.response!.data as APIRequestErrorMessage).message
        setLoading(false)
        setErrorMessage(errorResponseData)
        setShowErrorModal(true)
      });
  };

  return (
    <div className="container">
      <TextField
        id="webhook-name"
        label="Webhook name"
        variant="outlined"
        fullWidth
        onChange={(e) => setWebhookName(e.target.value)}
        sx={{ marginBottom: "10px" }}
      />
      <TextField
        id="command"
        label="Command"
        variant="outlined"
        fullWidth
        onChange={(e) => setCommand(e.target.value)}
        sx={{ marginBottom: "10px" }}
      />
      <FormControl fullWidth>
        <InputLabel id="authType-label">Authentication type</InputLabel>
        <Select
          labelId="authType-label"
          id="authType"
          value={authType}
          label="Authentication type"
          onChange={(e) => setAuthType(e.target.value)}
          sx={{ marginBottom: "10px" }}
        >
          <MenuItem value="github">
            Github secrets (input box on webhooks config)
          </MenuItem>
          <MenuItem value="auth-header">Authorization header</MenuItem>
        </Select>
      </FormControl>
      <TextField
        id="password"
        label="Password"
        variant="outlined"
        type="password"
        fullWidth
        onChange={(e) => setPass(e.target.value)}
        sx={{ marginBottom: "10px" }}
      />
      <Box sx={{ position: "relative" }}>
        <Button
          variant="contained"
          sx={{ float: "right" }}
          onClick={handleSubmit}
          disabled={!formValid() || loading}
        >
          Submit
        </Button>
        {loading && (
          <CircularProgress
            size={24}
            sx={{
              color: green[500],
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </Box>

      {showSuccessModal && (
        <CreateWebhookRequestCompletionModal
          postData={postData!}
          requestSuccess={true}
        />
      )}
      {showErrorModal && (
        <CreateWebhookRequestCompletionModal
          postData={postData!}
          requestSuccess={false}
          errorMsg={errorMessage}
        />
      )}
    </div>
  );
}

export default CreateWebhook;

interface APIRequestErrorMessage {
  successful: boolean
  message: string
}