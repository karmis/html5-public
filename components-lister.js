try {
  require('child_process').exec('npm ls --json --long', {maxBuffer: 1024 * 20000}, function (err, stdout, stderr) {
    data = JSON.parse(stdout);
    var d = data.dependencies;
    for (var i in d) {
      console.log(d[i].name + "," + d[i].version + "," + d[i].license + "," + (d[i].repository && d[i].repository.url))
    }
  });
} catch(e) {
  console.log(e);
}
