import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, Flame } from "lucide-react";

const Gigacock = () => {
  const contractAddress = "0x14aED785b3F951Eb5aC98250E8f4f530A2F83177";
  const burnTxHash = "https://scan.mypinata.cloud/ipfs/bafybeih3olry3is4e4lzm7rus5l3h6zrphcal5a7ayfkhzm5oivjro2cp4/#/tx/0x1ddbaf8f08e262a23178c8e4e9588fff3cf28110cd23039486e6b80f3864b445";
  const pulsexLink = "https://pulsex.mypinata.cloud/ipfs/bafybeiajyhfbf6evh4mdabassmbtsy73ci2gmcgh4ffmjkrgsea35vqxba/#/?inputCurrency=0xA1077a294dDE1B09bB078844df40758a5D0f9a27&outputCurrency=0x14aED785b3F951Eb5aC98250E8f4f530A2F83177";
  const libertyLink = "https://libertyswap.finance/";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="container mx-auto px-4 py-12 space-y-12">
        {/* Hero Section with Video */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            GIGACOCK
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The ultimate meme token on PulseChain
          </p>
          
          <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl">
            <video 
              controls 
              autoPlay 
              loop 
              muted
              className="w-full"
            >
              <source src="/gigacock-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Contract Info */}
        <Card className="p-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Contract Address</h2>
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg break-all">
              <code className="text-sm">{contractAddress}</code>
            </div>
          </div>
        </Card>

        {/* Buy Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
          <Button
            asChild
            size="lg"
            className="w-full md:w-auto bg-gradient-primary hover:opacity-90 shadow-lg shadow-primary/20"
          >
            <a href={pulsexLink} target="_blank" rel="noopener noreferrer">
              Buy on PulseX
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full md:w-auto"
          >
            <a href={libertyLink} target="_blank" rel="noopener noreferrer">
              Buy on Liberty
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Burn Info */}
        <Card className="p-8 max-w-4xl mx-auto bg-destructive/10 border-destructive/20">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-destructive" />
              <h2 className="text-2xl font-bold">Token Burn</h2>
            </div>
            <p className="text-muted-foreground">
              View the burn transaction on PulseChain explorer:
            </p>
            <Button
              asChild
              variant="outline"
              className="w-full"
            >
              <a href={burnTxHash} target="_blank" rel="noopener noreferrer">
                View Burn Transaction
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default Gigacock;
