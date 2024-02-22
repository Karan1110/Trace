import React, { useState } from "react"
import { Button } from "@radix-ui/themes"
import * as Bytescale from "@bytescale/sdk"
import { UploadButton } from "@bytescale/upload-widget-react"

const options = {
  apiKey: "public_FW25bvHCfLNhZvL9A1jtcm1PKMzL", // This is your API key.
  maxFileCount: 1,
  styles: {
    colors: {
      primary: "#377dff",
    },
  },
}

const Uploader = ({ ws }) => {
  const handleComplete = (files) => {
    const [uploadedFile] = files
    const { filePath, accountId } = uploadedFile
    // Construct the URL for the uploaded file with a thumbnail transformation
    const fileUrl = Bytescale.UrlBuilder.url({
      filePath,
      accountId,
      options: {
        transformation: "preset",
        transformationPreset: "thumbnail",
      },
    })

    ws.send(`send-image-karan112010=${fileUrl}`)
  }

  return (
    <UploadButton options={options} onComplete={handleComplete}>
      {({ onClick }) => <Button onClick={onClick}>Upload</Button>}
    </UploadButton>
  )
}

export default Uploader
