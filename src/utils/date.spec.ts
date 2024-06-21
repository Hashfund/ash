import moment from "moment";

async function main() {
  console.log({
    from: moment().subtract(3, "days").toISOString(),
    to: moment().toISOString(),
    unit: "day",
  });
}

main().catch(console.log);
